import type { Page } from '@playwright/test';
import { create } from 'qrcode';
import { crc32, fragmentFile } from '../../src/app/shared/utils/qr-protocol';

/** How the simulated browser offers the camera. */
export type CameraMode =
  /** The camera works and shows the QR images the test draws; ZXing reads them in the worker. */
  | 'working'
  /** The user denies the camera permission. */
  | 'denied'
  /** The device has no camera. */
  | 'no-camera'
  /** The browser has no camera API at all. */
  | 'unsupported';

/** Deterministic file content of `size` bytes. */
export const sampleBytes = (size: number): Uint8Array<ArrayBuffer> =>
  Uint8Array.from({ length: size }, (_, i) => (i * 7 + 3) % 256);

/** Splits a file into the fragments the sender would show. */
export const transfer = (
  name: string,
  type: string,
  bytes: Uint8Array<ArrayBuffer>,
  compress = false,
) =>
  // 400 B per fragment and, unless asked, no compression (not the app's defaults) so the counts of
  // these scenarios stay the same.
  fragmentFile({ name, type, bytes }, { dataSize: 400, compress });

/** Rewrites a fragment with another payload and a valid CRC, simulating well-formed but wrong content. */
export function withPayload(fragment: Uint8Array, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + payload.length + 4);
  out.set(fragment.subarray(0, 12));
  new DataView(out.buffer).setUint16(10, payload.length);
  out.set(payload, 12);
  new DataView(out.buffer).setUint32(
    12 + payload.length,
    crc32(out.subarray(0, 12 + payload.length)),
  );
  return out;
}

/** Fragment with its content altered, so its CRC no longer matches. */
export function corrupt(fragment: Uint8Array): Uint8Array {
  const copy = Uint8Array.from(fragment);
  copy[20] ^= 0xff;
  return copy;
}

/**
 * Replaces the camera before the application loads. Exposes `window.__camera` with how many times the
 * camera was opened and how many of its tracks were stopped, and counts in `window.__reads` how many
 * times the reading worker answered with the QR the test is showing (see {@link showQr}).
 */
export async function installFakeCamera(page: Page, mode: CameraMode = 'working'): Promise<void> {
  await page.addInitScript((cameraMode) => {
    const w = window as unknown as Record<string, unknown>;
    const camera = { opened: 0, stopped: 0 };
    w['__camera'] = camera;
    w['__reads'] = 0;
    w['__expected'] = null;

    // Counts the answers of the reading worker that carry the QR the test is showing.
    const NativeWorker = window.Worker;
    if (NativeWorker) {
      w['Worker'] = class extends NativeWorker {
        constructor(...args: ConstructorParameters<typeof Worker>) {
          super(...args);
          this.addEventListener('message', (event: MessageEvent) => {
            const bytes = event.data?.bytes?.[0] as Uint8Array | undefined;
            const expected = w['__expected'] as number[] | null;
            if (
              bytes &&
              expected &&
              bytes.length === expected.length &&
              expected.every((value, index) => bytes[index] === value)
            ) {
              w['__reads'] = (w['__reads'] as number) + 1;
            }
          });
        }
      };
    }

    if (cameraMode === 'unsupported') {
      Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
      return;
    }
    // A square camera view, large enough for the densest QR the sender can show.
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 960;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, 960, 960);
    w['__showQr'] = (size: number, modules: number[]) => {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, 960, 960);
      context.fillStyle = '#000';
      const margin = 4;
      const cell = Math.floor(960 / (size + margin * 2));
      const origin = Math.floor((960 - cell * size) / 2);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (modules[y * size + x]) {
            context.fillRect(origin + x * cell, origin + y * cell, cell, cell);
          }
        }
      }
    };
    // A pixel in the corner changes on every tick, so the canvas keeps producing video frames.
    let tick = 0;
    setInterval(() => {
      const previous = context.fillStyle;
      context.fillStyle = `rgb(${200 + (tick++ % 50)},255,255)`;
      context.fillRect(0, 0, 1, 1);
      context.fillStyle = previous;
    }, 50);

    navigator.mediaDevices.getUserMedia = async () => {
      if (cameraMode === 'denied') {
        throw new DOMException('denied', 'NotAllowedError');
      }
      if (cameraMode === 'no-camera') {
        throw new DOMException('none', 'NotFoundError');
      }
      camera.opened++;
      const stream = canvas.captureStream(15);
      stream.getTracks().forEach((track) => {
        const stop = track.stop.bind(track);
        track.stop = () => {
          camera.stopped++;
          stop();
        };
      });
      return stream;
    };
  }, mode);
}

/**
 * Shows each fragment as a real QR image in the simulated camera, in order, and waits until the app
 * has read it before showing the next one.
 */
export async function feed(page: Page, fragments: Uint8Array[]): Promise<void> {
  for (const fragment of fragments) {
    await showQr(page, fragment);
  }
}

/** Shows a fragment as a real QR image in the simulated camera and waits until the app reads it. */
export async function showQr(page: Page, fragment: Uint8Array): Promise<void> {
  const qr = create([{ data: fragment, mode: 'byte' }], { errorCorrectionLevel: 'M' });
  const reads = await page.evaluate(
    ({ size, modules, expected }) => {
      const w = window as unknown as {
        __reads: number;
        __expected: number[] | null;
        __showQr: (size: number, modules: number[]) => void;
      };
      w.__expected = expected;
      w.__showQr(size, modules);
      return w.__reads;
    },
    { size: qr.modules.size, modules: Array.from(qr.modules.data), expected: Array.from(fragment) },
  );
  await page.waitForFunction(
    (before) => (window as unknown as { __reads: number }).__reads > before,
    reads,
    { timeout: 10_000 },
  );
}

/** Names and sizes of the files saved in the private storage (without their metadata). */
export async function storedFiles(
  page: Page,
): Promise<{ name: string; type: string; size: number }[]> {
  return page.evaluate(async () => {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle('transfers', { create: true });
    const records: { name: string; type: string; size: number }[] = [];
    for await (const handle of dir.values()) {
      if (handle.kind === 'file' && handle.name.endsWith('.json')) {
        const file = await (handle as FileSystemFileHandle).getFile();
        records.push(JSON.parse(await file.text()));
      }
    }
    return records;
  });
}

/** Bytes of the first saved file called `name`, to compare with the original byte by byte. */
export async function storedBytes(page: Page, name: string): Promise<number[]> {
  return page.evaluate(async (fileName) => {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle('transfers');
    for await (const handle of dir.values()) {
      if (handle.kind === 'file' && handle.name.endsWith('.json')) {
        const record = JSON.parse(await (await (handle as FileSystemFileHandle).getFile()).text());
        if (record.name === fileName) {
          const content = await (await dir.getFileHandle(record.id)).getFile();
          return Array.from(new Uint8Array(await content.arrayBuffer()));
        }
      }
    }
    return [];
  }, name);
}

/** Clears the private storage so a test starts without history. */
export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry('transfers', { recursive: true }).catch(() => undefined);
  });
}

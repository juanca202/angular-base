import type { Page } from '@playwright/test';
import { create } from 'qrcode';
import { crc32, fragmentFile } from '../../src/app/shared/utils/qr-protocol';

/** How the simulated browser offers the camera and the QR reader. */
export type CameraMode =
  /** Camera works and `BarcodeDetector` reads the QR queued by the test (no image needed; no worker). */
  | 'detector'
  /** Camera works, `BarcodeDetector` is missing and QR images are drawn in the video for `jsQR`. */
  | 'fallback'
  /** The user denies the camera permission. */
  | 'denied'
  /** The device has no camera. */
  | 'no-camera'
  /** The browser has no camera API at all. */
  | 'unsupported';

/** Bytes as the text `BarcodeDetector` returns: one char per byte (latin1). */
export const latin1 = (bytes: Uint8Array): string => String.fromCharCode(...bytes);

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
 * Replaces the camera and the QR reader before the application loads. Exposes `window.__camera` with
 * how many times the camera was opened and how many of its tracks were stopped.
 */
export async function installFakeCamera(page: Page, mode: CameraMode = 'detector'): Promise<void> {
  await page.addInitScript((cameraMode) => {
    const w = window as unknown as Record<string, unknown>;
    const camera = { opened: 0, stopped: 0 };
    const queue: string[] = [];
    w['__camera'] = camera;
    w['__queue'] = queue;

    if (cameraMode === 'unsupported') {
      Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
    } else {
      // A camera view twice as wide as tall, so two QR codes fit side by side like on a sender screen.
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 480;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      context.fillStyle = '#fff';
      context.fillRect(0, 0, 960, 480);
      // Draws the modules of a QR matrix inside the 480 px slot that starts at `left`.
      const drawQr = (left: number, size: number, modules: number[]) => {
        const margin = 4;
        const cell = Math.floor(480 / (size + margin * 2));
        const origin = left + Math.floor((480 - cell * size) / 2);
        const top = Math.floor((480 - cell * size) / 2);
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (modules[y * size + x]) {
              context.fillRect(origin + x * cell, top + y * cell, cell, cell);
            }
          }
        }
      };
      // Shows one QR in the middle of the view, or two side by side when a second one is given.
      w['__showQr'] = (
        size: number,
        modules: number[],
        second?: { size: number; modules: number[] },
      ) => {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, 960, 480);
        context.fillStyle = '#000';
        if (second) {
          drawQr(0, size, modules);
          drawQr(480, second.size, second.modules);
        } else {
          drawQr(240, size, modules);
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

      const mediaDevices = navigator.mediaDevices;
      mediaDevices.getUserMedia = async () => {
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
    }

    if (cameraMode === 'fallback') {
      Object.defineProperty(window, 'BarcodeDetector', { value: undefined, configurable: true });
    } else {
      // The simulated detector lives in the page, which a Web Worker cannot see: without workers the
      // app reads the frames in the page with the same code. The `fallback` mode, with real QR
      // images, goes through the worker.
      Object.defineProperty(window, 'Worker', { value: undefined, configurable: true });
      w['BarcodeDetector'] = class {
        public async detect(): Promise<{ rawValue: string }[]> {
          const next = queue.shift();
          return next === undefined ? [] : [{ rawValue: next }];
        }
      };
    }
  }, mode);
}

/** Queues QR payloads for the simulated `BarcodeDetector`, in order, one per reading. */
export async function feed(page: Page, fragments: Uint8Array[]): Promise<void> {
  await page.evaluate(
    (items) => (window as unknown as { __queue: string[] }).__queue.push(...items),
    fragments.map(latin1),
  );
}

/**
 * Shows a fragment as a real QR image in the simulated camera (for the `jsQR` fallback), and a second
 * one beside it when given, as the sender does with two QR codes at once.
 */
export async function showQr(page: Page, fragment: Uint8Array, second?: Uint8Array): Promise<void> {
  const matrix = (bytes: Uint8Array) => {
    const qr = create([{ data: bytes, mode: 'byte' }], { errorCorrectionLevel: 'M' });
    return { size: qr.modules.size, modules: Array.from(qr.modules.data) };
  };
  const first = matrix(fragment);
  const other = second ? matrix(second) : undefined;
  await page.evaluate(
    ({ size, modules, other }) =>
      (
        window as unknown as {
          __showQr: (s: number, m: number[], second?: { size: number; modules: number[] }) => void;
        }
      ).__showQr(size, modules, other),
    { ...first, other },
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

import {
  prepareZXingModule,
  readBarcodes,
  type Position,
  type ReaderOptions,
  type ZXingModuleOverrides,
} from 'zxing-wasm/reader';

/** Area of a frame, in pixels. */
export interface QrRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A camera frame in any of the forms the reading accepts. */
export type QrSource = CanvasImageSource & { readonly width: number; readonly height: number };

/** Folder, under the app root, where the build copies the ZXing `.wasm` file (see `angular.json`). */
const WASM_FOLDER = 'zxing/';

/**
 * Where ZXing finds its `.wasm`: the copy served with the app, so reading works offline. The page
 * resolves it against its base URL and a Web Worker against the URL of its own script, which sits at
 * the app root too.
 */
const APP_WASM: ZXingModuleOverrides = {
  locateFile: (path: string, prefix: string) => {
    if (!path.endsWith('.wasm')) {
      return prefix + path;
    }
    const base = typeof document === 'undefined' ? globalThis.location.href : document.baseURI;
    return new URL(WASM_FOLDER + path, base).href;
  },
};

/** What is asked of ZXing: QR codes only, one per frame, and no search for rotated or inverted ones. */
const READER_OPTIONS: ReaderOptions = {
  formats: ['QRCode'],
  maxNumberOfSymbols: 1,
  tryRotate: false,
  tryInvert: false,
};

/** The rectangle that contains the corners of a QR. */
function boxOf(position: Position): QrRegion {
  const corners = [position.topLeft, position.topRight, position.bottomRight, position.bottomLeft];
  const left = Math.min(...corners.map((c) => c.x));
  const top = Math.min(...corners.map((c) => c.y));
  return {
    x: Math.round(left),
    y: Math.round(top),
    width: Math.round(Math.max(...corners.map((c) => c.x)) - left),
    height: Math.round(Math.max(...corners.map((c) => c.y)) - top),
  };
}

/**
 * Reads the bytes of the QR code in a camera frame with ZXing (WebAssembly). It has no dependency on
 * Angular or on the page, so the same code runs in a Web Worker (off the main thread) or, where workers
 * are unavailable, in the page itself.
 */
export class QrFrameReader {
  private canvas: OffscreenCanvas | null = null;
  private boxes: QrRegion[] = [];

  /**
   * @param wasm - Where ZXing gets its `.wasm`. The app's own copy by default; tests pass their own.
   * It must be the same object every time: ZXing compiles the module again whenever it changes.
   */
  constructor(private readonly wasm: ZXingModuleOverrides = APP_WASM) {
    prepareZXingModule({ overrides: wasm });
  }

  /**
   * Loads and compiles the ZXing module now, so the first frame does not wait for it (and so it is
   * already in memory if the connection is lost afterwards).
   */
  public async warmUp(): Promise<void> {
    await prepareZXingModule({ overrides: this.wasm, fireImmediately: true });
  }

  /**
   * Where, in frame pixels, each QR read by the last {@link read} was (in no particular order), so the
   * screen can draw a frame over it. Empty when nothing was read.
   */
  public get lastBoxes(): readonly QrRegion[] {
    return this.boxes;
  }

  /**
   * Reads the QR of a frame.
   *
   * @param bitmap - The camera frame. The caller releases it.
   * @returns The payload bytes of the QR read (at most one); empty when it could not be read.
   */
  public async read(bitmap: QrSource): Promise<Uint8Array[]> {
    this.boxes = [];
    const pixels = this.pixelsOf(bitmap);
    if (!pixels) {
      return [];
    }
    const [code] = await readBarcodes(pixels, READER_OPTIONS);
    if (!code?.isValid) {
      return [];
    }
    this.boxes.push(boxOf(code.position));
    return [Uint8Array.from(code.bytes)];
  }

  private pixelsOf(bitmap: QrSource): ImageData | null {
    const { width, height } = bitmap;
    if (width <= 0 || height <= 0) {
      return null;
    }
    this.canvas ??= new OffscreenCanvas(width, height);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return null;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    return context.getImageData(0, 0, width, height);
  }
}

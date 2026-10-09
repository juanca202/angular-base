/// <reference lib="webworker" />
import { QrFrameReader, QrRegion } from '@/features/receive/services/qr-frame-reader';

/** Request from the page: one camera frame to read, transferred to the worker. */
export interface QrWorkerRequest {
  readonly id: number;
  readonly bitmap: ImageBitmap;
  /** Areas where the page located a QR; empty to search the whole frame. */
  readonly regions: readonly QrRegion[];
}

/** Answer to a request, with the id of the request it belongs to. */
export interface QrWorkerResponse {
  readonly id: number;
  /** Payload of every QR read; empty when none could be read. */
  readonly bytes: readonly Uint8Array[];
  /** Why reading failed, if it did. */
  readonly error: string | null;
}

const reader = new QrFrameReader();

addEventListener('message', ({ data }: MessageEvent<QrWorkerRequest>) => {
  let response: QrWorkerResponse;
  try {
    response = { id: data.id, bytes: reader.read(data.bitmap, data.regions), error: null };
  } catch (failure) {
    const error =
      failure instanceof Error ? `${failure.name}: ${failure.message}` : String(failure);
    response = { id: data.id, bytes: [], error };
  } finally {
    data.bitmap.close();
  }
  postMessage(response);
});

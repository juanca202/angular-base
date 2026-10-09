/// <reference lib="webworker" />
import { QrFrameReader, QrRegion } from '@/features/receive/services/qr-frame-reader';

/** Request from the page: one camera frame to read, transferred to the worker. */
export interface QrWorkerRequest {
  readonly id: number;
  readonly bitmap: ImageBitmap;
}

/** Answer to a request, with the id of the request it belongs to. */
export interface QrWorkerResponse {
  readonly id: number;
  /** Payload of every QR read; empty when none could be read. */
  readonly bytes: readonly Uint8Array[];
  /** Where each QR read was in the frame, in pixels. */
  readonly boxes: readonly QrRegion[];
  /** Why reading failed, if it did. */
  readonly error: string | null;
}

const reader = new QrFrameReader();
// Loads ZXing as soon as the worker starts, before the first frame arrives.
void reader.warmUp().catch(() => undefined);

addEventListener('message', async ({ data }: MessageEvent<QrWorkerRequest>) => {
  let response: QrWorkerResponse;
  try {
    const bytes = await reader.read(data.bitmap);
    response = { id: data.id, bytes, boxes: reader.lastBoxes, error: null };
  } catch (failure) {
    const error =
      failure instanceof Error ? `${failure.name}: ${failure.message}` : String(failure);
    response = { id: data.id, bytes: [], boxes: [], error };
  } finally {
    data.bitmap.close();
  }
  postMessage(response);
});

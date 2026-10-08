import { StoredTransfer } from '@/core/models/stored-transfer';
import { ReceivedFile, ReceptionProgress, TransferMetadata } from '@/shared/utils/qr-protocol';

/**
 * Where the reception is:
 * - `idle`: nothing running, or stopped by cancel or a camera error.
 * - `starting`: the camera is being opened.
 * - `reading`: the camera is reading QR codes.
 * - `finishing`: the file is being rebuilt, verified and saved; further reads are ignored.
 * - `result`: the reception ended with a result that the screen must show.
 */
export type ReceivePhase = 'idle' | 'starting' | 'reading' | 'finishing' | 'result';

/** Transfer whose name and size were read and that waits for the user to confirm or discard it. */
export type PendingTransfer = TransferMetadata;

/** Progress shown while receiving. Before the first QR is read every value is empty. */
export interface ReceiveProgress extends ReceptionProgress {
  /** Name of the file, once its metadata was read. */
  readonly name: string | null;
  /** Total size of the file in bytes, once its metadata was read. */
  readonly size: number | null;
  /** Percentage of fragments received, from 0 to 100. */
  readonly percent: number;
  /** Estimated seconds left, or `null` while there are too few fragments to estimate it. */
  readonly remainingSeconds: number | null;
}

/** Result of a reception. Only «completed» saves and registers the file. */
export type ReceiveResult =
  | { readonly outcome: 'completed'; readonly record: StoredTransfer; readonly file: ReceivedFile }
  | { readonly outcome: 'incomplete'; readonly progress: ReceptionProgress }
  | { readonly outcome: 'invalid-data' }
  | { readonly outcome: 'unreconstructable' }
  /** The file is verified but the storage quota ran out; nothing was saved or registered. */
  | { readonly outcome: 'storage-full'; readonly file: ReceivedFile }
  /** The file is verified but saving it failed for another reason; nothing was registered. */
  | { readonly outcome: 'save-failed'; readonly file: ReceivedFile };

/** Progress with nothing received yet. */
export const EMPTY_RECEIVE_PROGRESS: ReceiveProgress = {
  name: null,
  size: null,
  received: 0,
  total: 0,
  percent: 0,
  remainingSeconds: null,
};

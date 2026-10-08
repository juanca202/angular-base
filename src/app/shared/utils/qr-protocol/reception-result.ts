/** Final outcome of a reception attempt. */
export type ReceptionOutcome = 'completed' | 'incomplete' | 'invalid-data' | 'unreconstructable';

/** Fragments received so far out of the total announced by the transfer (`total` is 0 until known). */
export interface ReceptionProgress {
  readonly received: number;
  readonly total: number;
}

/** Name, type and size announced by the metadata fragment of a transfer. */
export interface TransferMetadata {
  readonly name: string;
  readonly type: string;
  readonly size: number;
}

/** File rebuilt from a verified transfer. */
export interface ReceivedFile extends TransferMetadata {
  readonly bytes: Uint8Array<ArrayBuffer>;
}

/**
 * Result of closing a reception: «completed» only when every fragment arrived and the SHA-256 matches.
 * «incomplete» keeps the valid fragments so the reading can go on.
 */
export type ReceptionResult =
  | { readonly outcome: 'completed'; readonly file: ReceivedFile }
  | { readonly outcome: 'incomplete'; readonly progress: ReceptionProgress }
  | { readonly outcome: 'invalid-data' }
  | { readonly outcome: 'unreconstructable' };

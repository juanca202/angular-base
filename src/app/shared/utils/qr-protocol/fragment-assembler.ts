import { FRAGMENT_KIND_METADATA, SHA256_SIZE } from '@/shared/utils/qr-protocol/constants';
import { ParsedFragment, parseFragment } from '@/shared/utils/qr-protocol/parse-fragment';
import {
  ReceptionProgress,
  ReceptionResult,
  TransferMetadata,
} from '@/shared/utils/qr-protocol/reception-result';

/** Size of the fixed part of the metadata payload: SHA-256, file size, name length and type length. */
const METADATA_FIXED_SIZE = SHA256_SIZE + 8;

/** What happened to a fragment handed to {@link FragmentAssembler.accept}. */
export type FragmentStatus = 'accepted' | 'duplicate' | 'invalid' | 'other-transfer';

interface DecodedMetadata extends TransferMetadata {
  readonly sha256: Uint8Array;
}

function decodeMetadata(payload: Uint8Array): DecodedMetadata | null {
  if (payload.length < METADATA_FIXED_SIZE) {
    return null;
  }
  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  const size = view.getUint32(SHA256_SIZE);
  const nameLength = view.getUint16(SHA256_SIZE + 4);
  const typeLength = view.getUint16(SHA256_SIZE + 6);
  if (payload.length !== METADATA_FIXED_SIZE + nameLength + typeLength) {
    return null;
  }
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const name = decoder.decode(
      payload.subarray(METADATA_FIXED_SIZE, METADATA_FIXED_SIZE + nameLength),
    );
    const type = decoder.decode(payload.subarray(METADATA_FIXED_SIZE + nameLength));
    return { name, type, size, sha256: payload.slice(0, SHA256_SIZE) };
  } catch {
    return null;
  }
}

/**
 * Collects the fragments of one transfer read from QR codes and rebuilds the file.
 *
 * It tolerates what a camera produces: corrupt reads, fragments of another transfer, repeated and
 * out-of-order fragments. The transfer is pinned by the first valid fragment (or by the identifier
 * given to the constructor); fragments of any other transfer are discarded. Nothing is persisted: the
 * fragments live only in this instance.
 *
 * @example
 * ```typescript
 * const assembler = new FragmentAssembler();
 * assembler.accept(bytesReadFromQr);
 * const result = await assembler.finish();
 * ```
 */
export class FragmentAssembler {
  private pinnedId: number | null;
  private total = 0;
  private fragments = new Map<number, Uint8Array>();
  private metadataFragment: Uint8Array | null = null;

  /**
   * @param transferId - Transfer to follow; when omitted, the first valid fragment pins it.
   */
  constructor(transferId?: number) {
    this.pinnedId = transferId ?? null;
  }

  /** Identifier of the pinned transfer, or `null` while no valid fragment has been read. */
  public get transferId(): number | null {
    return this.pinnedId;
  }

  /** Fragments received out of the total announced by the transfer. */
  public get progress(): ReceptionProgress {
    return { received: this.fragments.size, total: this.total };
  }

  /** Name, type and size of the file, or `null` until a well-formed metadata fragment is read. */
  public get metadata(): TransferMetadata | null {
    const decoded = this.metadataFragment ? decodeMetadata(this.metadataFragment) : null;
    return decoded ? { name: decoded.name, type: decoded.type, size: decoded.size } : null;
  }

  /**
   * Validates a fragment read from a QR code and stores it when it belongs to this transfer.
   *
   * @param bytes - Raw bytes of one QR code.
   */
  public accept(bytes: Uint8Array): FragmentStatus {
    const fragment = parseFragment(bytes);
    return fragment ? this.acceptParsed(fragment) : 'invalid';
  }

  /**
   * Rebuilds the file if every fragment arrived and verifies its SHA-256.
   *
   * Calling it with fragments missing returns «incomplete» and keeps the valid ones, so the reading
   * can go on and `finish` can be called again.
   */
  public async finish(): Promise<ReceptionResult> {
    if (this.total === 0 || this.fragments.size < this.total) {
      return { outcome: 'incomplete', progress: this.progress };
    }
    const metadata = this.metadataFragment ? decodeMetadata(this.metadataFragment) : null;
    if (!metadata) {
      return { outcome: 'unreconstructable' };
    }
    const chunks = Array.from(
      { length: this.total - 1 },
      (_, i) => this.fragments.get(i + 1) as Uint8Array,
    );
    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    if (length !== metadata.size) {
      return { outcome: 'unreconstructable' };
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    if (digest.some((value, i) => value !== metadata.sha256[i])) {
      return { outcome: 'invalid-data' };
    }
    return {
      outcome: 'completed',
      file: { name: metadata.name, type: metadata.type, size: length, bytes },
    };
  }

  /** Discards every fragment and releases the pinned transfer. */
  public reset(): void {
    this.pinnedId = null;
    this.total = 0;
    this.fragments = new Map();
    this.metadataFragment = null;
  }

  private acceptParsed(fragment: ParsedFragment): FragmentStatus {
    if (this.pinnedId !== null && fragment.transferId !== this.pinnedId) {
      return 'other-transfer';
    }
    if (this.total !== 0 && fragment.total !== this.total) {
      return 'invalid';
    }
    if (this.fragments.has(fragment.index)) {
      return 'duplicate';
    }
    this.pinnedId = fragment.transferId;
    this.total = fragment.total;
    // Copy: the bytes may be a view over a buffer that the camera reader reuses.
    const payload = fragment.payload.slice();
    this.fragments.set(fragment.index, payload);
    if (fragment.kind === FRAGMENT_KIND_METADATA) {
      this.metadataFragment = payload;
    }
    return 'accepted';
  }
}

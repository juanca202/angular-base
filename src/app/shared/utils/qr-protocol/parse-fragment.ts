import { crc32 } from '@/shared/utils/qr-protocol/crc32';
import {
  CRC_SIZE,
  FRAGMENT_KIND_DATA,
  FRAGMENT_KIND_METADATA,
  HEADER_SIZE,
  PROTOCOL_VERSION,
} from '@/shared/utils/qr-protocol/constants';

/** Fragment already validated: its CRC, version and lengths are consistent. */
export interface ParsedFragment {
  /** {@link FRAGMENT_KIND_METADATA} (position 0) or {@link FRAGMENT_KIND_DATA}. */
  readonly kind: number;
  /** Random identifier shared by every fragment of one transfer. */
  readonly transferId: number;
  /** Position of the fragment: 0 is the metadata, 1..total-1 carry data. */
  readonly index: number;
  /** Number of fragments of the transfer, metadata included. */
  readonly total: number;
  /** Fragment content without header or CRC. */
  readonly payload: Uint8Array;
}

/**
 * Validates and decodes a fragment read from a QR code.
 *
 * Anything that does not match the format written by `fragmentFile` is rejected: a different version,
 * an inconsistent length, a position outside the total, a kind that does not fit its position or a
 * CRC32 mismatch. Rejection never throws, since camera reads are expected to be noisy.
 *
 * @param bytes - Raw bytes of one QR code.
 * @returns The decoded fragment, or `null` when it is corrupt or invalid.
 */
export function parseFragment(bytes: Uint8Array): ParsedFragment | null {
  if (bytes.length < HEADER_SIZE + CRC_SIZE) {
    return null;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const kind = view.getUint8(1);
  const index = view.getUint16(6);
  const total = view.getUint16(8);
  const length = view.getUint16(10);
  const valid =
    view.getUint8(0) === PROTOCOL_VERSION &&
    bytes.length === HEADER_SIZE + length + CRC_SIZE &&
    total >= 1 &&
    index < total &&
    (kind === FRAGMENT_KIND_METADATA) === (index === 0) &&
    (kind === FRAGMENT_KIND_METADATA || kind === FRAGMENT_KIND_DATA) &&
    view.getUint32(HEADER_SIZE + length) === crc32(bytes.subarray(0, HEADER_SIZE + length));
  if (!valid) {
    return null;
  }
  return {
    kind,
    transferId: view.getUint32(2),
    index,
    total,
    payload: bytes.subarray(HEADER_SIZE, HEADER_SIZE + length),
  };
}

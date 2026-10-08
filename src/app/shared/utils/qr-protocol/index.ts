export { crc32 } from '@/shared/utils/qr-protocol/crc32';
export {
  CRC_SIZE,
  DEFAULT_DATA_SIZE,
  FRAGMENT_KIND_DATA,
  FRAGMENT_KIND_METADATA,
  HEADER_SIZE,
  MAX_FRAGMENTS,
  PROTOCOL_VERSION,
  SHA256_SIZE,
} from '@/shared/utils/qr-protocol/constants';
export {
  QrProtocolError,
  countFragments,
  fragmentFile,
} from '@/shared/utils/qr-protocol/fragment-file';
export type {
  FragmentOptions,
  ProtocolFile,
  QrProtocolErrorCode,
} from '@/shared/utils/qr-protocol/fragment-file';

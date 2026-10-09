import { deflate, isCompressionSupported } from '@/shared/utils/qr-protocol/compression';
import { crc32 } from '@/shared/utils/qr-protocol/crc32';
import {
  CRC_SIZE,
  DEFAULT_DATA_SIZE,
  ENCODING_DEFLATE,
  ENCODING_NONE,
  FRAGMENT_KIND_DATA,
  FRAGMENT_KIND_METADATA,
  HEADER_SIZE,
  MAX_FRAGMENTS,
  PROTOCOL_VERSION,
  SHA256_SIZE,
} from '@/shared/utils/qr-protocol/constants';

/** Motivos por los que el protocolo rechaza una fragmentación. */
export type QrProtocolErrorCode = 'too-many-fragments' | 'metadata-too-large' | 'invalid-data-size';

/** Error tipado del protocolo; `code` permite a la interfaz elegir el mensaje sin inspeccionar el texto. */
export class QrProtocolError extends Error {
  public readonly code: QrProtocolErrorCode;

  constructor(code: QrProtocolErrorCode, message: string) {
    super(message);
    this.name = 'QrProtocolError';
    this.code = code;
  }
}

/** Archivo a fragmentar, ya leído en memoria (el módulo no conoce `File` ni el DOM). */
export interface ProtocolFile {
  /** Nombre del archivo, tal como lo verá el receptor. */
  name: string;
  /** Tipo MIME; cadena vacía si el navegador no lo conoce. */
  type: string;
  /** Contenido completo del archivo. */
  bytes: Uint8Array<ArrayBuffer>;
}

/** Parámetros opcionales de la fragmentación. */
export interface FragmentOptions {
  /** Bytes de archivo por fragmento de datos. Por defecto {@link DEFAULT_DATA_SIZE}. */
  dataSize?: number;
  /**
   * Si se intenta comprimir el archivo para transmitir menos QR. Se transmite comprimido solo cuando
   * eso lo hace más pequeño y el entorno lo permite. Por defecto `true`.
   */
  compress?: boolean;
}

function assertDataSize(dataSize: number): void {
  if (!Number.isInteger(dataSize) || dataSize < 1 || dataSize > 0xffff) {
    throw new QrProtocolError(
      'invalid-data-size',
      `El tamaño de datos por fragmento debe ser un entero entre 1 y 65535 (recibido ${dataSize}).`,
    );
  }
}

/**
 * Calcula cuántos fragmentos (metadatos incluidos) requiere un archivo como máximo, sin leerlo.
 * Permite validar el límite con solo el tamaño, antes de cargar el contenido. Es una cota: el primer
 * fragmento también lleva datos, de modo que la fragmentación real puede necesitar uno menos.
 *
 * @param fileSize - Tamaño del archivo en bytes.
 * @param dataSize - Bytes de archivo por fragmento de datos.
 * @returns Número total de fragmentos de la transferencia.
 * @throws {QrProtocolError} `too-many-fragments` si supera {@link MAX_FRAGMENTS}.
 */
export function countFragments(fileSize: number, dataSize: number = DEFAULT_DATA_SIZE): number {
  assertDataSize(dataSize);
  const total = 1 + Math.ceil(fileSize / dataSize);
  if (total > MAX_FRAGMENTS) {
    throw new QrProtocolError(
      'too-many-fragments',
      `El archivo requiere ${total} fragmentos y el protocolo admite como máximo ${MAX_FRAGMENTS}.`,
    );
  }
  return total;
}

function encodeFragment(
  kind: number,
  transferId: number,
  index: number,
  total: number,
  payload: Uint8Array,
): Uint8Array {
  const fragment = new Uint8Array(HEADER_SIZE + payload.length + CRC_SIZE);
  const view = new DataView(fragment.buffer);
  view.setUint8(0, PROTOCOL_VERSION);
  view.setUint8(1, kind);
  view.setUint32(2, transferId);
  view.setUint16(6, index);
  view.setUint16(8, total);
  view.setUint16(10, payload.length);
  fragment.set(payload, HEADER_SIZE);
  view.setUint32(
    HEADER_SIZE + payload.length,
    crc32(fragment.subarray(0, HEADER_SIZE + payload.length)),
  );
  return fragment;
}

/**
 * Carga del fragmento de metadatos: SHA-256 del archivo original | tamaño original(4) | tamaño
 * transmitido(4) | codificación(1) | long. nombre(2) | long. tipo(2) | nombre | tipo.
 */
function encodeMetadata(
  file: ProtocolFile,
  sha256: Uint8Array,
  transferSize: number,
  encoding: number,
): Uint8Array {
  const encoder = new TextEncoder();
  const name = encoder.encode(file.name);
  const type = encoder.encode(file.type);
  const payload = new Uint8Array(SHA256_SIZE + 13 + name.length + type.length);
  const view = new DataView(payload.buffer);
  payload.set(sha256, 0);
  view.setUint32(SHA256_SIZE, file.bytes.length);
  view.setUint32(SHA256_SIZE + 4, transferSize);
  view.setUint8(SHA256_SIZE + 8, encoding);
  view.setUint16(SHA256_SIZE + 9, name.length);
  view.setUint16(SHA256_SIZE + 11, type.length);
  payload.set(name, SHA256_SIZE + 13);
  payload.set(type, SHA256_SIZE + 13 + name.length);
  return payload;
}

/**
 * Convierte un archivo en la lista ordenada de fragmentos que se emitirán como QR.
 *
 * La posición 0 es el fragmento de metadatos (SHA-256 del archivo completo, tamaños, codificación,
 * nombre y tipo) y, a continuación, los primeros datos hasta llenar el fragmento; las posiciones 1..n
 * llevan el resto de los datos, comprimidos con deflate cuando eso reduce el tamaño. Cada fragmento es binario: versión, tipo, identificador de
 * transferencia aleatorio, posición, total, longitud, carga y CRC32 de todo lo anterior.
 *
 * @param file - Archivo ya leído en memoria.
 * @param options - Parámetros opcionales (tamaño de datos por fragmento).
 * @returns Los fragmentos en el orden de emisión.
 * @throws {QrProtocolError} Si el archivo excede el máximo de fragmentos, si los metadatos no caben
 * en un fragmento o si el tamaño de datos es inválido.
 */
export async function fragmentFile(
  file: ProtocolFile,
  options: FragmentOptions = {},
): Promise<Uint8Array[]> {
  const dataSize = options.dataSize ?? DEFAULT_DATA_SIZE;
  assertDataSize(dataSize);

  const sha256 = new Uint8Array(await crypto.subtle.digest('SHA-256', file.bytes));
  let transfer: Uint8Array<ArrayBuffer> = file.bytes;
  let encoding = ENCODING_NONE;
  if ((options.compress ?? true) && file.bytes.length > 0 && isCompressionSupported()) {
    const compressed = await deflate(file.bytes);
    if (compressed.length < file.bytes.length) {
      transfer = compressed;
      encoding = ENCODING_DEFLATE;
    }
  }
  countFragments(transfer.length, dataSize); // cota: rechaza pronto lo que no cabe en el protocolo
  const metadata = encodeMetadata(file, sha256, transfer.length, encoding);
  if (metadata.length > dataSize) {
    throw new QrProtocolError(
      'metadata-too-large',
      `El nombre y el tipo del archivo no caben en un fragmento de ${dataSize} B.`,
    );
  }

  // El primer QR no se desperdicia: tras los metadatos lleva los primeros datos hasta llenarse.
  const firstData = transfer.subarray(0, dataSize - metadata.length);
  const total = countFragments(transfer.length - firstData.length, dataSize);
  const first = new Uint8Array(metadata.length + firstData.length);
  first.set(metadata);
  first.set(firstData, metadata.length);

  const transferId = crypto.getRandomValues(new Uint32Array(1))[0];
  const fragments = [encodeFragment(FRAGMENT_KIND_METADATA, transferId, 0, total, first)];
  for (let index = 1; index < total; index++) {
    const start = firstData.length + (index - 1) * dataSize;
    const chunk = transfer.subarray(start, start + dataSize);
    fragments.push(encodeFragment(FRAGMENT_KIND_DATA, transferId, index, total, chunk));
  }
  return fragments;
}

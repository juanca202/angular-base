/** Número de versión del formato de fragmento; se escribe en el primer byte de cada fragmento. */
export const PROTOCOL_VERSION = 1;

/** Tipo de fragmento: metadatos del archivo (siempre en la posición 0). */
export const FRAGMENT_KIND_METADATA = 0;

/** Tipo de fragmento: bloque de datos del archivo (posiciones 1..total-1). */
export const FRAGMENT_KIND_DATA = 1;

/** Bytes de la cabecera: versión(1) + tipo(1) + id de transferencia(4) + posición(2) + total(2) + longitud(2). */
export const HEADER_SIZE = 12;

/** Bytes del CRC32 que cierra cada fragmento. */
export const CRC_SIZE = 4;

/** Bytes de datos del archivo por fragmento si no se indica otro valor. */
export const DEFAULT_DATA_SIZE = 400;

/** Máximo de fragmentos por transferencia (metadatos incluidos); la posición y el total son de 16 bits. */
export const MAX_FRAGMENTS = 0xffff;

/** Bytes del hash SHA-256 que viaja en los metadatos. */
export const SHA256_SIZE = 32;

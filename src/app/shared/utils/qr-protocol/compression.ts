/** Formato de compresión usado en la transferencia: deflate sin cabecera (RFC 1951). */
const FORMAT = 'deflate-raw';

/** Indica si el entorno ofrece compresión y descompresión nativas. */
export function isCompressionSupported(): boolean {
  return typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';
}

/**
 * Pasa los bytes por un flujo de transformación y recoge su salida.
 *
 * @param bytes - Entrada.
 * @param stream - Flujo de compresión o descompresión.
 * @param maxSize - Si se indica, aborta al superar este tamaño de salida (protege de bombas de descompresión).
 */
async function run(
  bytes: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream,
  maxSize?: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const writer = stream.writable.getWriter();
  // Un error de la entrada (datos corruptos) aflora al leer la salida; aquí solo se evita el rechazo suelto.
  void writer
    .write(bytes)
    .then(() => writer.close())
    .catch(() => undefined);
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.length;
    if (maxSize !== undefined && total > maxSize) {
      await reader.cancel();
      throw new Error('La salida supera el tamaño anunciado.');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Comprime los bytes con deflate.
 *
 * @param bytes - Contenido a comprimir.
 * @returns Los bytes comprimidos.
 */
export function deflate(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  return run(bytes, new CompressionStream(FORMAT));
}

/**
 * Descomprime bytes deflate.
 *
 * @param bytes - Contenido comprimido.
 * @param maxSize - Tamaño máximo esperado de la salida.
 * @returns Los bytes originales.
 * @throws Si los datos no son deflate válido o la salida supera `maxSize`.
 */
export function inflate(
  bytes: Uint8Array<ArrayBuffer>,
  maxSize: number,
): Promise<Uint8Array<ArrayBuffer>> {
  return run(bytes, new DecompressionStream(FORMAT), maxSize);
}

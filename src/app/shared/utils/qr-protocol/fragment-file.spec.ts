import { describe, it, expect, vi, afterEach } from 'vitest';
import { crc32 } from '@/shared/utils/qr-protocol/crc32';
import {
  CRC_SIZE,
  DEFAULT_DATA_SIZE,
  FRAGMENT_KIND_DATA,
  FRAGMENT_KIND_METADATA,
  HEADER_SIZE,
  MAX_FRAGMENTS,
  PROTOCOL_VERSION,
  SHA256_SIZE,
} from '@/shared/utils/qr-protocol/constants';
import {
  FragmentOptions,
  ProtocolFile,
  QrProtocolError,
  countFragments,
  fragmentFile,
} from '@/shared/utils/qr-protocol/fragment-file';
import { ENCODING_DEFLATE, ENCODING_NONE } from '@/shared/utils/qr-protocol/constants';
import { inflate } from '@/shared/utils/qr-protocol/compression';

interface DecodedFragment {
  version: number;
  kind: number;
  transferId: number;
  index: number;
  total: number;
  payload: Uint8Array;
  crcValid: boolean;
}

/** Receptor mínimo de pruebas: decodifica la cabecera de un fragmento. */
function decode(fragment: Uint8Array): DecodedFragment {
  const view = new DataView(fragment.buffer, fragment.byteOffset, fragment.byteLength);
  const length = view.getUint16(10);
  const body = fragment.subarray(0, HEADER_SIZE + length);
  return {
    version: view.getUint8(0),
    kind: view.getUint8(1),
    transferId: view.getUint32(2),
    index: view.getUint16(6),
    total: view.getUint16(8),
    payload: fragment.subarray(HEADER_SIZE, HEADER_SIZE + length),
    crcValid: view.getUint32(HEADER_SIZE + length) === crc32(body),
  };
}

/** Fragmenta sin comprimir: así los conteos de estas pruebas dependen solo del tamaño del archivo. */
const plain = (file: ProtocolFile, options: FragmentOptions = {}) =>
  fragmentFile(file, { compress: false, ...options });

/** Lee los metadatos del fragmento de posición 0. */
function decodeMetadata(payload: Uint8Array) {
  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  const nameLength = view.getUint16(SHA256_SIZE + 9);
  const typeLength = view.getUint16(SHA256_SIZE + 11);
  const start = SHA256_SIZE + 13;
  const decoder = new TextDecoder();
  return {
    sha256: payload.subarray(0, SHA256_SIZE),
    size: view.getUint32(SHA256_SIZE),
    transferSize: view.getUint32(SHA256_SIZE + 4),
    encoding: view.getUint8(SHA256_SIZE + 8),
    name: decoder.decode(payload.subarray(start, start + nameLength)),
    type: decoder.decode(payload.subarray(start + nameLength, start + nameLength + typeLength)),
  };
}

/** Receptor mínimo de pruebas: reconstruye los bytes transmitidos (los datos del primer fragmento incluidos). */
function reassemble(fragments: Uint8Array[]): Uint8Array {
  const parts = fragments
    .map(decode)
    .sort((a, b) => a.index - b.index)
    .map((f) => {
      if (f.kind !== FRAGMENT_KIND_METADATA) {
        return f.payload;
      }
      const view = new DataView(f.payload.buffer, f.payload.byteOffset, f.payload.byteLength);
      const header =
        SHA256_SIZE + 13 + view.getUint16(SHA256_SIZE + 9) + view.getUint16(SHA256_SIZE + 11);
      return f.payload.subarray(header);
    });
  const result = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function deterministicBytes(size: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = (i * 31 + 7) % 256;
  }
  return bytes;
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

describe('fragmentFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should give every fragment a complete header and a valid CRC', async () => {
    // Arrange
    const file = { name: 'prueba-100KB.bin', type: '', bytes: deterministicBytes(102_400) };

    // Act
    const fragments = await plain(file);
    const decoded = fragments.map(decode);

    // Assert
    expect(decoded.every((f) => f.crcValid)).toBe(true);
    expect(decoded.every((f) => f.total === fragments.length)).toBe(true);
    expect(decoded.map((f) => f.index)).toEqual(fragments.map((_, i) => i));
    expect(new Set(decoded.map((f) => f.transferId)).size).toBe(1);
    expect(decoded.every((f) => f.version === PROTOCOL_VERSION)).toBe(true);
  });

  it('should put the metadata in the first fragment and data in the rest', async () => {
    // Arrange
    const file = { name: 'a.bin', type: '', bytes: deterministicBytes(1000) };

    // Act
    const decoded = (await plain(file)).map(decode);

    // Assert
    expect(decoded[0].kind).toBe(FRAGMENT_KIND_METADATA);
    expect(decoded.slice(1).every((f) => f.kind === FRAGMENT_KIND_DATA)).toBe(true);
  });

  it('should let the receiver recover the original name and type', async () => {
    // Arrange
    const file = { name: 'informe.pdf', type: 'application/pdf', bytes: deterministicBytes(5120) };

    // Act
    const [metadata] = await plain(file);
    const result = decodeMetadata(decode(metadata).payload);

    // Assert
    expect(result.name).toBe('informe.pdf');
    expect(result.type).toBe('application/pdf');
    expect(result.size).toBe(5120);
  });

  it('should preserve non-ASCII names', async () => {
    // Arrange
    const file = { name: 'año-señal ✓.txt', type: 'text/plain', bytes: deterministicBytes(10) };

    // Act
    const [metadata] = await plain(file);

    // Assert
    expect(decodeMetadata(decode(metadata).payload).name).toBe('año-señal ✓.txt');
  });

  it('should include the SHA-256 of the whole file in the metadata', async () => {
    // Arrange
    const bytes = deterministicBytes(102_400);
    const expected = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));

    // Act
    const [metadata] = await plain({ name: 'prueba-100KB.bin', type: '', bytes });

    // Assert
    expect(hex(decodeMetadata(decode(metadata).payload).sha256)).toBe(hex(expected));
  });

  it('should use 1600 B data fragments by default and rebuild the file from many fragments', async () => {
    // Arrange
    const bytes = deterministicBytes(102_400);

    // Act
    const fragments = await plain({ name: 'prueba-100KB.bin', type: '', bytes });
    const data = fragments.map(decode).filter((f) => f.kind === FRAGMENT_KIND_DATA);

    // Assert
    expect(DEFAULT_DATA_SIZE).toBe(1600);
    expect(data.length).toBe(64);
    expect(data.slice(0, -1).every((f) => f.payload.length === 1600)).toBe(true);
    expect(fragments[1].length).toBe(HEADER_SIZE + 1600 + CRC_SIZE);
    expect(reassemble(fragments)).toEqual(bytes);
  });

  it('should accept a custom data size', async () => {
    // Arrange
    const bytes = deterministicBytes(1000);

    // Act
    const fragments = await plain({ name: 'a.bin', type: '', bytes }, { dataSize: 100 });

    // Assert
    expect(fragments).toHaveLength(11);
    expect(reassemble(fragments)).toEqual(bytes);
  });

  it('should use a different transfer id on each transfer', async () => {
    // Arrange
    const file = { name: 'a.bin', type: '', bytes: deterministicBytes(10) };

    // Act
    const ids = await Promise.all(
      Array.from({ length: 5 }, async () => decode((await plain(file))[0]).transferId),
    );

    // Assert
    expect(new Set(ids).size).toBeGreaterThan(1);
  });

  it('should fragment and reassemble without DOM or camera', async () => {
    // Arrange
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('window', undefined);
    const bytes = deterministicBytes(1024);

    // Act
    const fragments = await plain({ name: 'prueba-1KB.bin', type: '', bytes });

    // Assert
    expect(decode(fragments[0]).version).toBe(PROTOCOL_VERSION);
    expect(reassemble(fragments)).toEqual(bytes);
  });

  it('should reject a file that needs more fragments than the protocol allows', async () => {
    // Arrange
    const options = { dataSize: 1 };
    const oversized = { name: 'a.bin', type: '', bytes: new Uint8Array(MAX_FRAGMENTS) };

    // Act
    const act = plain(oversized, options);

    // Assert
    await expect(act).rejects.toMatchObject({ code: 'too-many-fragments' });
  });

  it('should reject metadata that does not fit in a single fragment', async () => {
    // Arrange
    const file = { name: 'x'.repeat(DEFAULT_DATA_SIZE), type: '', bytes: deterministicBytes(10) };

    // Act
    const act = plain(file);

    // Assert
    await expect(act).rejects.toMatchObject({ code: 'metadata-too-large' });
  });

  it.each([0, -1, 1.5, 70_000])('should reject an invalid data size (%s)', async (dataSize) => {
    // Arrange
    const file = { name: 'a.bin', type: '', bytes: deterministicBytes(10) };

    // Act
    const act = plain(file, { dataSize });

    // Assert
    await expect(act).rejects.toBeInstanceOf(QrProtocolError);
  });
});

describe('fragmentFile with compression', () => {
  afterEach(() => vi.unstubAllGlobals());

  const compressible = () => new Uint8Array(50_000).fill(7);
  const random = () => crypto.getRandomValues(new Uint8Array(2000));

  it('should send a compressible file compressed, in far fewer fragments, and announce it', async () => {
    // Arrange
    const bytes = compressible();

    // Act
    const fragments = await fragmentFile({ name: 'ceros.bin', type: '', bytes });
    const metadata = decodeMetadata(decode(fragments[0]).payload);

    // Assert
    expect(metadata.encoding).toBe(ENCODING_DEFLATE);
    expect(metadata.size).toBe(50_000);
    expect(metadata.transferSize).toBeLessThan(1000);
    expect(fragments.length).toBeLessThan(countFragments(50_000));
    const sent = reassemble(fragments);
    expect(sent.length).toBe(metadata.transferSize);
    expect(await inflate(sent as Uint8Array<ArrayBuffer>, 50_000)).toEqual(bytes);
  });

  it('should keep the hash of the original file, not of the compressed one', async () => {
    // Arrange
    const bytes = compressible();
    const expected = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));

    // Act
    const [metadata] = await fragmentFile({ name: 'ceros.bin', type: '', bytes });

    // Assert
    expect(hex(decodeMetadata(decode(metadata).payload).sha256)).toBe(hex(expected));
  });

  it('should send a file that does not compress as it is', async () => {
    // Arrange
    const bytes = random();

    // Act
    const fragments = await fragmentFile({ name: 'azar.bin', type: '', bytes });
    const metadata = decodeMetadata(decode(fragments[0]).payload);

    // Assert
    expect(metadata.encoding).toBe(ENCODING_NONE);
    expect(metadata.transferSize).toBe(2000);
    expect(reassemble(fragments)).toEqual(bytes);
  });

  it('should not compress when asked not to', async () => {
    // Act
    const fragments = await fragmentFile(
      { name: 'ceros.bin', type: '', bytes: compressible() },
      { compress: false },
    );

    // Assert
    expect(decodeMetadata(decode(fragments[0]).payload).encoding).toBe(ENCODING_NONE);
    // El primer QR también lleva datos: uno menos que la cota que da countFragments.
    expect(fragments.length).toBe(countFragments(50_000) - 1);
  });

  it('should send as it is when the environment cannot compress', async () => {
    // Arrange
    vi.stubGlobal('CompressionStream', undefined);

    // Act
    const fragments = await fragmentFile({ name: 'ceros.bin', type: '', bytes: compressible() });

    // Assert
    expect(decodeMetadata(decode(fragments[0]).payload).encoding).toBe(ENCODING_NONE);
  });

  it('should send an empty file as it is', async () => {
    // Act
    const fragments = await fragmentFile({ name: 'vacio.bin', type: '', bytes: new Uint8Array(0) });

    // Assert
    expect(decodeMetadata(decode(fragments[0]).payload)).toMatchObject({ size: 0, encoding: 0 });
  });

  it('should let a compressible file bigger than the plain limit through, since fewer fragments are needed', async () => {
    // Arrange: 30 MB of zeros would need ~39k plain fragments (it fits); 60 MB would not.
    const bytes = new Uint8Array(60_000_000);

    // Act
    const fragments = await fragmentFile({ name: 'enorme.bin', type: '', bytes });

    // Assert
    expect(fragments.length).toBeLessThan(MAX_FRAGMENTS);
    expect(decodeMetadata(decode(fragments[0]).payload).encoding).toBe(ENCODING_DEFLATE);
  });
});

describe('countFragments', () => {
  it('should count the metadata fragment plus the data fragments', () => {
    // Arrange
    const size = 3000;

    // Act
    const result = countFragments(size);

    // Assert
    expect(result).toBe(1 + 2);
  });

  it('should accept the largest size that fits and reject one byte more', () => {
    // Arrange
    const dataSize = DEFAULT_DATA_SIZE;
    const largest = (MAX_FRAGMENTS - 1) * dataSize;

    // Act
    const ok = countFragments(largest, dataSize);
    const tooMany = () => countFragments(largest + 1, dataSize);

    // Assert
    expect(ok).toBe(MAX_FRAGMENTS);
    expect(tooMany).toThrowError(QrProtocolError);
  });
});

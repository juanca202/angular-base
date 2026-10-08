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
  QrProtocolError,
  countFragments,
  fragmentFile,
} from '@/shared/utils/qr-protocol/fragment-file';

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

/** Lee los metadatos del fragmento de posición 0. */
function decodeMetadata(payload: Uint8Array) {
  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  const nameLength = view.getUint16(SHA256_SIZE + 4);
  const typeLength = view.getUint16(SHA256_SIZE + 6);
  const start = SHA256_SIZE + 8;
  const decoder = new TextDecoder();
  return {
    sha256: payload.subarray(0, SHA256_SIZE),
    size: view.getUint32(SHA256_SIZE),
    name: decoder.decode(payload.subarray(start, start + nameLength)),
    type: decoder.decode(payload.subarray(start + nameLength, start + nameLength + typeLength)),
  };
}

/** Receptor mínimo de pruebas: reconstruye los bytes del archivo. */
function reassemble(fragments: Uint8Array[]): Uint8Array {
  const parts = fragments
    .map(decode)
    .filter((f) => f.kind === FRAGMENT_KIND_DATA)
    .sort((a, b) => a.index - b.index)
    .map((f) => f.payload);
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
    const fragments = await fragmentFile(file);
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
    const decoded = (await fragmentFile(file)).map(decode);

    // Assert
    expect(decoded[0].kind).toBe(FRAGMENT_KIND_METADATA);
    expect(decoded.slice(1).every((f) => f.kind === FRAGMENT_KIND_DATA)).toBe(true);
  });

  it('should let the receiver recover the original name and type', async () => {
    // Arrange
    const file = { name: 'informe.pdf', type: 'application/pdf', bytes: deterministicBytes(5120) };

    // Act
    const [metadata] = await fragmentFile(file);
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
    const [metadata] = await fragmentFile(file);

    // Assert
    expect(decodeMetadata(decode(metadata).payload).name).toBe('año-señal ✓.txt');
  });

  it('should include the SHA-256 of the whole file in the metadata', async () => {
    // Arrange
    const bytes = deterministicBytes(102_400);
    const expected = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));

    // Act
    const [metadata] = await fragmentFile({ name: 'prueba-100KB.bin', type: '', bytes });

    // Assert
    expect(hex(decodeMetadata(decode(metadata).payload).sha256)).toBe(hex(expected));
  });

  it('should use 400 B data fragments by default and rebuild the file from many fragments', async () => {
    // Arrange
    const bytes = deterministicBytes(102_400);

    // Act
    const fragments = await fragmentFile({ name: 'prueba-100KB.bin', type: '', bytes });
    const data = fragments.map(decode).filter((f) => f.kind === FRAGMENT_KIND_DATA);

    // Assert
    expect(DEFAULT_DATA_SIZE).toBe(400);
    expect(data.length).toBeGreaterThan(250);
    expect(data.slice(0, -1).every((f) => f.payload.length === 400)).toBe(true);
    expect(fragments[1].length).toBe(HEADER_SIZE + 400 + CRC_SIZE);
    expect(reassemble(fragments)).toEqual(bytes);
  });

  it('should accept a custom data size', async () => {
    // Arrange
    const bytes = deterministicBytes(1000);

    // Act
    const fragments = await fragmentFile({ name: 'a.bin', type: '', bytes }, { dataSize: 100 });

    // Assert
    expect(fragments).toHaveLength(11);
    expect(reassemble(fragments)).toEqual(bytes);
  });

  it('should use a different transfer id on each transfer', async () => {
    // Arrange
    const file = { name: 'a.bin', type: '', bytes: deterministicBytes(10) };

    // Act
    const ids = await Promise.all(
      Array.from({ length: 5 }, async () => decode((await fragmentFile(file))[0]).transferId),
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
    const fragments = await fragmentFile({ name: 'prueba-1KB.bin', type: '', bytes });

    // Assert
    expect(decode(fragments[0]).version).toBe(PROTOCOL_VERSION);
    expect(reassemble(fragments)).toEqual(bytes);
  });

  it('should reject a file that needs more fragments than the protocol allows', async () => {
    // Arrange
    const options = { dataSize: 1 };
    const oversized = { name: 'a.bin', type: '', bytes: new Uint8Array(MAX_FRAGMENTS) };

    // Act
    const act = fragmentFile(oversized, options);

    // Assert
    await expect(act).rejects.toMatchObject({ code: 'too-many-fragments' });
  });

  it('should reject metadata that does not fit in a single fragment', async () => {
    // Arrange
    const file = { name: 'x'.repeat(400), type: '', bytes: deterministicBytes(10) };

    // Act
    const act = fragmentFile(file);

    // Assert
    await expect(act).rejects.toMatchObject({ code: 'metadata-too-large' });
  });

  it.each([0, -1, 1.5, 70_000])('should reject an invalid data size (%s)', async (dataSize) => {
    // Arrange
    const file = { name: 'a.bin', type: '', bytes: deterministicBytes(10) };

    // Act
    const act = fragmentFile(file, { dataSize });

    // Assert
    await expect(act).rejects.toBeInstanceOf(QrProtocolError);
  });
});

describe('countFragments', () => {
  it('should count the metadata fragment plus the data fragments', () => {
    // Arrange
    const size = 1000;

    // Act
    const result = countFragments(size);

    // Assert
    expect(result).toBe(1 + 3);
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

import { describe, it, expect } from 'vitest';
import { crc32 } from '@/shared/utils/qr-protocol/crc32';
import { FragmentAssembler } from '@/shared/utils/qr-protocol/fragment-assembler';
import { fragmentFile } from '@/shared/utils/qr-protocol/fragment-file';
import { CRC_SIZE, HEADER_SIZE } from '@/shared/utils/qr-protocol/constants';

function sampleBytes(size: number): Uint8Array<ArrayBuffer> {
  return Uint8Array.from({ length: size }, (_, i) => (i * 7 + 3) % 256);
}

async function transfer(size = 1000, name = 'foto.png', type = 'image/png'): Promise<Uint8Array[]> {
  return fragmentFile({ name, type, bytes: sampleBytes(size) });
}

/** Rewrites a fragment with a new payload and a valid CRC, to simulate well-formed but wrong content. */
function withPayload(fragment: Uint8Array, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(HEADER_SIZE + payload.length + CRC_SIZE);
  out.set(fragment.subarray(0, HEADER_SIZE));
  new DataView(out.buffer).setUint16(10, payload.length);
  out.set(payload, HEADER_SIZE);
  new DataView(out.buffer).setUint32(
    HEADER_SIZE + payload.length,
    crc32(out.subarray(0, HEADER_SIZE + payload.length)),
  );
  return out;
}

function feed(assembler: FragmentAssembler, fragments: Uint8Array[]): void {
  fragments.forEach((fragment) => assembler.accept(fragment));
}

describe('FragmentAssembler', () => {
  it('rebuilds a byte-identical file and verifies it', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const assembler = new FragmentAssembler();
    // Act
    feed(assembler, fragments);
    const result = await assembler.finish();
    // Assert
    expect(result.outcome).toBe('completed');
    if (result.outcome === 'completed') {
      expect(result.file.name).toBe('foto.png');
      expect(result.file.type).toBe('image/png');
      expect(result.file.size).toBe(1000);
      expect(result.file.bytes).toEqual(sampleBytes(1000));
    }
  });

  it('accepts fragments in any order', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const assembler = new FragmentAssembler();
    // Act
    feed(assembler, [...fragments].reverse());
    const result = await assembler.finish();
    // Assert
    expect(result.outcome).toBe('completed');
    expect(assembler.progress).toEqual({ received: 4, total: 4 });
  });

  it('ignores repeated fragments without altering the result', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const assembler = new FragmentAssembler();
    // Act
    const statuses = [fragments[1], fragments[1], fragments[1]].map((f) => assembler.accept(f));
    feed(assembler, fragments);
    const result = await assembler.finish();
    // Assert
    expect(statuses).toEqual(['accepted', 'duplicate', 'duplicate']);
    expect(assembler.progress.received).toBe(4);
    expect(result.outcome).toBe('completed');
  });

  it('discards corrupt fragments and accepts their intact retransmission', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const corrupt = Uint8Array.from(fragments[2]);
    corrupt[30] ^= 0xff;
    const assembler = new FragmentAssembler();
    // Act
    const status = assembler.accept(corrupt);
    feed(assembler, fragments);
    // Assert
    expect(status).toBe('invalid');
    expect((await assembler.finish()).outcome).toBe('completed');
  });

  it('discards fragments of another transfer once its own transfer is pinned', async () => {
    // Arrange
    const mine = await transfer(1000);
    const other = await transfer(1000, 'otro.bin', 'application/octet-stream');
    const assembler = new FragmentAssembler();
    assembler.accept(mine[0]);
    // Act
    const status = assembler.accept(other[1]);
    feed(assembler, mine);
    // Assert
    expect(status).toBe('other-transfer');
    expect(assembler.progress).toEqual({ received: 4, total: 4 });
    expect((await assembler.finish()).outcome).toBe('completed');
  });

  it('rejects a fragment whose total disagrees with the pinned transfer', async () => {
    // Arrange
    const first = (await transfer(1000))[0];
    const assembler = new FragmentAssembler();
    assembler.accept(first);
    const tampered = Uint8Array.from((await transfer(1000))[1]);
    const view = new DataView(tampered.buffer);
    view.setUint32(2, new DataView(first.buffer).getUint32(2));
    view.setUint16(8, 9);
    view.setUint32(
      tampered.length - CRC_SIZE,
      crc32(tampered.subarray(0, tampered.length - CRC_SIZE)),
    );
    // Act & Assert
    expect(assembler.accept(tampered)).toBe('invalid');
  });

  it('reports the metadata as soon as its fragment is read', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const assembler = new FragmentAssembler();
    // Act
    assembler.accept(fragments[2]);
    const before = assembler.metadata;
    assembler.accept(fragments[0]);
    // Assert
    expect(before).toBeNull();
    expect(assembler.metadata).toEqual({ name: 'foto.png', type: 'image/png', size: 1000 });
  });

  it('reports incomplete when closed with missing fragments and keeps the valid ones', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const assembler = new FragmentAssembler();
    feed(assembler, fragments.slice(0, 3));
    // Act
    const result = await assembler.finish();
    feed(assembler, fragments.slice(3));
    // Assert
    expect(result).toEqual({ outcome: 'incomplete', progress: { received: 3, total: 4 } });
    expect((await assembler.finish()).outcome).toBe('completed');
  });

  it('reports invalid data when every fragment arrived but the hash does not match', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const altered = Uint8Array.from(fragments[1].subarray(12, fragments[1].length - 4));
    altered[0] ^= 0x01;
    const assembler = new FragmentAssembler();
    // Act
    feed(assembler, [fragments[0], withPayload(fragments[1], altered), ...fragments.slice(2)]);
    const result = await assembler.finish();
    // Assert
    expect(result).toEqual({ outcome: 'invalid-data' });
  });

  it('reports unreconstructable when the metadata is inconsistent with the data', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const metadata = Uint8Array.from(fragments[0].subarray(12, fragments[0].length - 4));
    new DataView(metadata.buffer).setUint32(32, 5000);
    const assembler = new FragmentAssembler();
    // Act
    feed(assembler, [withPayload(fragments[0], metadata), ...fragments.slice(1)]);
    const result = await assembler.finish();
    // Assert
    expect(result).toEqual({ outcome: 'unreconstructable' });
  });

  it('reports unreconstructable when the metadata payload is malformed', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const assembler = new FragmentAssembler();
    // Act
    feed(assembler, [withPayload(fragments[0], new Uint8Array(5)), ...fragments.slice(1)]);
    // Assert
    expect(assembler.metadata).toBeNull();
    expect(await assembler.finish()).toEqual({ outcome: 'unreconstructable' });
  });

  it('starts over from scratch after reset', async () => {
    // Arrange
    const fragments = await transfer(1000);
    const assembler = new FragmentAssembler();
    feed(assembler, fragments.slice(0, 2));
    // Act
    assembler.reset();
    // Assert
    expect(assembler.progress).toEqual({ received: 0, total: 0 });
    expect(assembler.transferId).toBeNull();
    expect(assembler.metadata).toBeNull();
  });

  it('rebuilds a file of exactly one data fragment and an empty name', async () => {
    // Arrange
    const fragments = await fragmentFile({ name: '', type: '', bytes: sampleBytes(10) });
    const assembler = new FragmentAssembler();
    // Act
    feed(assembler, fragments);
    // Assert
    expect((await assembler.finish()).outcome).toBe('completed');
  });
});

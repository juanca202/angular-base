import { describe, it, expect } from 'vitest';
import { crc32 } from '@/shared/utils/qr-protocol/crc32';
import { FragmentAssembler } from '@/shared/utils/qr-protocol/fragment-assembler';
import { countFragments, fragmentFile } from '@/shared/utils/qr-protocol/fragment-file';
import { CRC_SIZE, HEADER_SIZE } from '@/shared/utils/qr-protocol/constants';

function sampleBytes(size: number): Uint8Array<ArrayBuffer> {
  return Uint8Array.from({ length: size }, (_, i) => (i * 7 + 3) % 256);
}

async function transfer(size = 1200, name = 'foto.png', type = 'image/png'): Promise<Uint8Array[]> {
  // 400 B per fragment and no compression (not the defaults) so the counts of these scenarios stay the same.
  return fragmentFile({ name, type, bytes: sampleBytes(size) }, { dataSize: 400, compress: false });
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
    const fragments = await transfer(1200);
    const assembler = new FragmentAssembler();
    // Act
    feed(assembler, fragments);
    const result = await assembler.finish();
    // Assert
    expect(result.outcome).toBe('completed');
    if (result.outcome === 'completed') {
      expect(result.file.name).toBe('foto.png');
      expect(result.file.type).toBe('image/png');
      expect(result.file.size).toBe(1200);
      expect(result.file.bytes).toEqual(sampleBytes(1200));
    }
  });

  it('lists the positions of the fragments received so far', async () => {
    const fragments = await transfer();
    const assembler = new FragmentAssembler();

    assembler.accept(fragments[3]);
    assembler.accept(fragments[0]);
    assembler.accept(fragments[3]);

    expect([...assembler.receivedIndices].sort((a, b) => a - b)).toEqual([0, 3]);
  });

  it('accepts fragments in any order', async () => {
    // Arrange
    const fragments = await transfer(1200);
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
    const fragments = await transfer(1200);
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
    const fragments = await transfer(1200);
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
    const mine = await transfer(1200);
    const other = await transfer(1200, 'otro.bin', 'application/octet-stream');
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
    const first = (await transfer(1200))[0];
    const assembler = new FragmentAssembler();
    assembler.accept(first);
    const tampered = Uint8Array.from((await transfer(1200))[1]);
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
    const fragments = await transfer(1200);
    const assembler = new FragmentAssembler();
    // Act
    assembler.accept(fragments[2]);
    const before = assembler.metadata;
    assembler.accept(fragments[0]);
    // Assert
    expect(before).toBeNull();
    expect(assembler.metadata).toEqual({
      name: 'foto.png',
      type: 'image/png',
      size: 1200,
      transferSize: 1200,
    });
  });

  it('reports incomplete when closed with missing fragments and keeps the valid ones', async () => {
    // Arrange
    const fragments = await transfer(1200);
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
    const fragments = await transfer(1200);
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
    const fragments = await transfer(1200);
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
    const fragments = await transfer(1200);
    const assembler = new FragmentAssembler();
    // Act
    feed(assembler, [withPayload(fragments[0], new Uint8Array(5)), ...fragments.slice(1)]);
    // Assert
    expect(assembler.metadata).toBeNull();
    expect(await assembler.finish()).toEqual({ outcome: 'unreconstructable' });
  });

  it('starts over from scratch after reset', async () => {
    // Arrange
    const fragments = await transfer(1200);
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

  describe('a compressed transfer', () => {
    /** Texto de letras pseudoaleatorias: se comprime algo, pero conserva muchos fragmentos. */
    const compressible = () => {
      let seed = 12345;
      const text = Array.from({ length: 40_000 }, () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return String.fromCharCode(97 + ((seed >> 8) % 26));
      }).join('');
      return new TextEncoder().encode(text) as Uint8Array<ArrayBuffer>;
    };
    const send = (bytes: Uint8Array<ArrayBuffer>) =>
      fragmentFile({ name: 'ceros.bin', type: 'application/octet-stream', bytes });

    it('rebuilds the original file, byte-identical, and reports its original size', async () => {
      // Arrange
      const bytes = compressible();
      const fragments = await send(bytes);
      const assembler = new FragmentAssembler();
      // Act
      feed(assembler, fragments);
      const result = await assembler.finish();
      // Assert
      expect(fragments.length).toBeGreaterThan(2);
      expect(fragments.length).toBeLessThan(countFragments(40_000));
      expect(assembler.metadata).toMatchObject({ size: bytes.length });
      expect(assembler.metadata?.transferSize).toBeLessThan(bytes.length * 0.8);
      expect(result.outcome).toBe('completed');
      expect(result.outcome === 'completed' ? Array.from(result.file.bytes) : null).toEqual(
        Array.from(bytes),
      );
    });

    it('reports invalid data when the compressed content was altered but still inflates', async () => {
      // Arrange
      const fragments = await send(compressible());
      const altered = Uint8Array.from(
        fragments[1].subarray(HEADER_SIZE, fragments[1].length - CRC_SIZE),
      );
      altered[altered.length - 1] ^= 0xff;
      const assembler = new FragmentAssembler();
      feed(assembler, [fragments[0], withPayload(fragments[1], altered), ...fragments.slice(2)]);
      // Act
      const result = await assembler.finish();
      // Assert
      expect(['invalid-data', 'unreconstructable']).toContain(result.outcome);
    });

    it('is unreconstructable when the compressed content is not valid deflate', async () => {
      // Arrange
      const fragments = await send(compressible());
      const garbage = new Uint8Array(fragments[1].length - HEADER_SIZE - CRC_SIZE).fill(0xff);
      const assembler = new FragmentAssembler();
      feed(assembler, [fragments[0], withPayload(fragments[1], garbage), ...fragments.slice(2)]);
      // Act
      const result = await assembler.finish();
      // Assert
      expect(result).toEqual({ outcome: 'unreconstructable' });
    });

    it('stops inflating a transfer that expands beyond the size it announced', async () => {
      // Arrange: metadata announcing 10 B for a payload that inflates to 50 000 B
      const fragments = await send(compressible());
      const metadata = Uint8Array.from(
        fragments[0].subarray(HEADER_SIZE, fragments[0].length - CRC_SIZE),
      );
      new DataView(metadata.buffer).setUint32(32, 10);
      const assembler = new FragmentAssembler();
      feed(assembler, [withPayload(fragments[0], metadata), ...fragments.slice(1)]);
      // Act
      const result = await assembler.finish();
      // Assert
      expect(result).toEqual({ outcome: 'unreconstructable' });
    });
  });
});

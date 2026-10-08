import { describe, it, expect } from 'vitest';
import { fragmentFile } from '@/shared/utils/qr-protocol/fragment-file';
import { parseFragment } from '@/shared/utils/qr-protocol/parse-fragment';
import { FRAGMENT_KIND_DATA, FRAGMENT_KIND_METADATA } from '@/shared/utils/qr-protocol/constants';

async function sampleFragments(size = 1000): Promise<Uint8Array[]> {
  const bytes = Uint8Array.from({ length: size }, (_, i) => i % 251);
  return fragmentFile({ name: 'a.bin', type: 'application/octet-stream', bytes });
}

describe('parseFragment', () => {
  it('decodes the metadata and data fragments produced by fragmentFile', async () => {
    // Arrange
    const fragments = await sampleFragments(1000);
    // Act
    const metadata = parseFragment(fragments[0]);
    const data = parseFragment(fragments[1]);
    // Assert
    expect(metadata).toMatchObject({ kind: FRAGMENT_KIND_METADATA, index: 0, total: 4 });
    expect(data).toMatchObject({ kind: FRAGMENT_KIND_DATA, index: 1, total: 4 });
    expect(data?.payload.length).toBe(400);
    expect(data?.transferId).toBe(metadata?.transferId);
  });

  it('discards a fragment whose content was altered (CRC mismatch)', async () => {
    // Arrange
    const fragment = Uint8Array.from((await sampleFragments())[1]);
    fragment[20] ^= 0xff;
    // Act & Assert
    expect(parseFragment(fragment)).toBeNull();
  });

  it('discards a truncated fragment', async () => {
    // Arrange
    const fragment = (await sampleFragments())[1];
    // Act & Assert
    expect(parseFragment(fragment.subarray(0, fragment.length - 3))).toBeNull();
    expect(parseFragment(new Uint8Array(3))).toBeNull();
  });

  it('discards a fragment of an unknown protocol version', async () => {
    // Arrange
    const fragment = Uint8Array.from((await sampleFragments())[1]);
    fragment[0] = 99;
    // Act & Assert
    expect(parseFragment(fragment)).toBeNull();
  });

  it('discards arbitrary bytes that are not a fragment', () => {
    expect(parseFragment(new TextEncoder().encode('https://example.com'))).toBeNull();
  });
});

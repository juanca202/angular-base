import { describe, it, expect } from 'vitest';
import { formatSeconds, formatSize } from '@/shared/utils/format';

describe('formatSize', () => {
  it.each([
    [0, '0 B'],
    [1023, '1023 B'],
    [1024, '1.0 KB'],
    [102_400, '100.0 KB'],
    [1_258_291, '1.2 MB'],
    [3 * 1024 ** 3, '3.0 GB'],
  ])('formats %d bytes as %s', (bytes, expected) => {
    expect(formatSize(bytes)).toBe(expected);
  });
});

describe('formatSeconds', () => {
  it.each([
    [5, '5 s'],
    [59.6, '1 min 0 s'],
    [70, '1 min 10 s'],
    [600, '10 min 0 s'],
  ])('formats %d seconds as %s', (seconds, expected) => {
    expect(formatSeconds(seconds)).toBe(expected);
  });
});

import { describe, it, expect } from 'vitest';
import { formatSeconds } from '@/shared/utils/format';

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

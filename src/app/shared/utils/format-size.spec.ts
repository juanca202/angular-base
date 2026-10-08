import { describe, expect, it } from 'vitest';
import { formatSize } from '@/shared/utils/format-size';

describe('formatSize', () => {
  it('muestra los bytes tal cual por debajo de 1 KB', () => {
    expect(formatSize(0)).toBe('0 B');
    expect(formatSize(1023)).toBe('1023 B');
  });

  it('usa la unidad más legible con un decimal', () => {
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(150 * 1024)).toBe('150.0 KB');
    expect(formatSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatSize(5 * 1024 ** 3)).toBe('5.0 GB');
  });
});

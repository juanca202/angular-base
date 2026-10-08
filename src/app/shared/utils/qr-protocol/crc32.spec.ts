import { describe, it, expect } from 'vitest';
import { crc32 } from '@/shared/utils/qr-protocol/crc32';

describe('crc32', () => {
  it('should match the standard check value for "123456789"', () => {
    // Arrange
    const bytes = new TextEncoder().encode('123456789');

    // Act
    const result = crc32(bytes);

    // Assert
    expect(result).toBe(0xcbf43926);
  });

  it('should return 0 for an empty input', () => {
    // Arrange
    const bytes = new Uint8Array(0);

    // Act
    const result = crc32(bytes);

    // Assert
    expect(result).toBe(0);
  });

  it('should change when a single byte changes', () => {
    // Arrange
    const original = new Uint8Array([1, 2, 3, 4]);
    const altered = new Uint8Array([1, 2, 3, 5]);

    // Act
    const result = crc32(original) === crc32(altered);

    // Assert
    expect(result).toBe(false);
  });
});

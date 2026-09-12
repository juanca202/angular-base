import { describe, it, expect } from 'vitest';
import { getRandomNumber } from '@/shared/utils/random';

describe('getRandomNumber', () => {
  it('should return a number within the specified range', () => {
    // Arrange
    const min = 10;
    const max = 20;

    // Act
    const result = getRandomNumber(min, max);

    // Assert
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  it('should return a number when min equals max', () => {
    // Arrange
    const min = 5;
    const max = 5;

    // Act
    const result = getRandomNumber(min, max);

    // Assert
    expect(result).toBe(min);
  });

  it('should return different numbers on multiple calls', () => {
    // Arrange
    const min = 1;
    const max = 100;
    const results: number[] = [];

    // Act
    for (let i = 0; i < 10; i++) {
      results.push(getRandomNumber(min, max));
    }

    // Assert
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBeGreaterThan(1);
  });

  it('should handle negative min and max values', () => {
    // Arrange
    const min = -10;
    const max = -5;

    // Act
    const result = getRandomNumber(min, max);

    // Assert
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });
});

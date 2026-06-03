import { describe, it, expect, beforeEach } from 'vitest';
import { LayoutManager } from './layout-manager';

describe('LayoutManager', () => {
  // Arrange
  let service: LayoutManager;

  beforeEach(() => {
    // Arrange: Create service instance directly
    service = new LayoutManager();
  });

  describe('getRandomNumber', () => {
    it('should return a number within the specified range', () => {
      // Arrange
      const min = 10;
      const max = 20;

      // Act
      const result = service.getRandomNumber(min, max);

      // Assert
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });

    it('should return a number when min equals max', () => {
      // Arrange
      const min = 5;
      const max = 5;

      // Act
      const result = service.getRandomNumber(min, max);

      // Assert
      // When min equals max, Math.random() * (max - min + 1) = Math.random() * 1 = [0, 1)
      // Math.floor gives 0, so result = 0 + min = min
      expect(result).toBe(min);
    });

    it('should return different numbers on multiple calls', () => {
      // Arrange
      const min = 1;
      const max = 100;
      const results: number[] = [];

      // Act
      for (let i = 0; i < 10; i++) {
        results.push(service.getRandomNumber(min, max));
      }

      // Assert
      // With a range of 1-100, it's very unlikely all 10 calls return the same value
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it('should handle negative min and max values', () => {
      // Arrange
      const min = -10;
      const max = -5;

      // Act
      const result = service.getRandomNumber(min, max);

      // Assert
      // The method calculates: Math.floor(Math.random() * (max - min + 1)) + min
      // For min=-10, max=-5: range is (-5) - (-10) + 1 = 6, so random * 6 gives [0, 6)
      // Math.floor gives [0, 5], so result is [-10, -5]
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });
  });

  describe('setOverlapped', () => {
    it('should add ft-overlapped class when event is false', () => {
      // Arrange
      const element = document.createElement('div');
      const event = false;

      // Act
      service.setOverlapped(event, element);

      // Assert
      expect(element.classList.contains('ft-overlapped')).toBe(true);
    });

    it('should remove ft-overlapped class when event is true', () => {
      // Arrange
      const element = document.createElement('div');
      element.classList.add('ft-overlapped');
      const event = true;

      // Act
      service.setOverlapped(event, element);

      // Assert
      expect(element.classList.contains('ft-overlapped')).toBe(false);
    });

    it('should handle ElementRef-like object with nativeElement', () => {
      // Arrange
      const nativeElement = document.createElement('div');
      const elementRef = { nativeElement };
      const event = false;

      // Act
      service.setOverlapped(event, elementRef);

      // Assert
      expect(nativeElement.classList.contains('ft-overlapped')).toBe(true);
    });

    it('should not throw error when element is null', () => {
      // Arrange
      const element = null;
      const event = false;

      // Act & Assert
      expect(() => service.setOverlapped(event, element)).not.toThrow();
    });

    it('should not throw error when element is undefined', () => {
      // Arrange
      const element = undefined;
      const event = false;

      // Act & Assert
      expect(() => service.setOverlapped(event, element)).not.toThrow();
    });

    it('should handle element without nativeElement property', () => {
      // Arrange
      const element = { nativeElement: undefined } as { nativeElement?: HTMLElement };
      const event = false;

      // Act & Assert
      expect(() => service.setOverlapped(event, element)).not.toThrow();
    });

    it('should toggle class correctly when called multiple times', () => {
      // Arrange
      const element = document.createElement('div');

      // Act
      service.setOverlapped(false, element);
      const hasClassAfterFalse = element.classList.contains('ft-overlapped');
      service.setOverlapped(true, element);
      const hasClassAfterTrue = element.classList.contains('ft-overlapped');
      service.setOverlapped(false, element);
      const hasClassAfterSecondFalse = element.classList.contains('ft-overlapped');

      // Assert
      expect(hasClassAfterFalse).toBe(true);
      expect(hasClassAfterTrue).toBe(false);
      expect(hasClassAfterSecondFalse).toBe(true);
    });
  });
});

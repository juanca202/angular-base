import { describe, it, expect } from 'vitest';
import { setOverlapped } from '@/shared/utils/overlap';

describe('setOverlapped', () => {
  it('should add ft-overlapped class when overlapped is false', () => {
    // Arrange
    const element = document.createElement('div');

    // Act
    setOverlapped(false, element);

    // Assert
    expect(element.classList.contains('ft-overlapped')).toBe(true);
  });

  it('should remove ft-overlapped class when overlapped is true', () => {
    // Arrange
    const element = document.createElement('div');
    element.classList.add('ft-overlapped');

    // Act
    setOverlapped(true, element);

    // Assert
    expect(element.classList.contains('ft-overlapped')).toBe(false);
  });

  it('should handle ElementRef-like object with nativeElement', () => {
    // Arrange
    const nativeElement = document.createElement('div');
    const elementRef = { nativeElement };

    // Act
    setOverlapped(false, elementRef);

    // Assert
    expect(nativeElement.classList.contains('ft-overlapped')).toBe(true);
  });

  it('should not throw error when element is null', () => {
    // Act & Assert
    expect(() => setOverlapped(false, null)).not.toThrow();
  });

  it('should not throw error when element is undefined', () => {
    // Act & Assert
    expect(() => setOverlapped(false, undefined)).not.toThrow();
  });

  it('should handle element without nativeElement property', () => {
    // Arrange
    const element = { nativeElement: undefined } as { nativeElement?: HTMLElement };

    // Act & Assert
    expect(() => setOverlapped(false, element)).not.toThrow();
  });

  it('should toggle class correctly when called multiple times', () => {
    // Arrange
    const element = document.createElement('div');

    // Act
    setOverlapped(false, element);
    const hasClassAfterFalse = element.classList.contains('ft-overlapped');
    setOverlapped(true, element);
    const hasClassAfterTrue = element.classList.contains('ft-overlapped');
    setOverlapped(false, element);
    const hasClassAfterSecondFalse = element.classList.contains('ft-overlapped');

    // Assert
    expect(hasClassAfterFalse).toBe(true);
    expect(hasClassAfterTrue).toBe(false);
    expect(hasClassAfterSecondFalse).toBe(true);
  });
});

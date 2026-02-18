import { describe, it, expect } from 'vitest';
import { LANGUAGES } from './languages';

describe('LANGUAGES', () => {
  it('should export languages array', () => {
    // Arrange & Act & Assert
    expect(LANGUAGES).toBeDefined();
    expect(Array.isArray(LANGUAGES)).toBe(true);
  });

  it('should contain English language', () => {
    // Arrange & Act
    const english = LANGUAGES.find((lang) => lang.code === 'en');

    // Assert
    expect(english).toBeDefined();
    expect(english?.code).toBe('en');
    expect(english?.name).toBe('English');
  });

  it('should contain Spanish language', () => {
    // Arrange & Act
    const spanish = LANGUAGES.find((lang) => lang.code === 'es');

    // Assert
    expect(spanish).toBeDefined();
    expect(spanish?.code).toBe('es');
    expect(spanish?.name).toBe('Español');
  });

  it('should have valid Language structure for all entries', () => {
    // Arrange & Act & Assert
    LANGUAGES.forEach((lang) => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('name');
      expect(typeof lang.code).toBe('string');
      expect(typeof lang.name).toBe('string');
      expect(lang.code.length).toBeGreaterThan(0);
      expect(lang.name.length).toBeGreaterThan(0);
    });
  });

  it('should have unique language codes', () => {
    // Arrange
    const codes = LANGUAGES.map((lang) => lang.code);

    // Act & Assert
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

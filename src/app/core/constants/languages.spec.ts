import { describe, it, expect } from 'vitest';
import { LANGUAGES } from './languages';
import { Language } from '@factor_ec/utils';

describe('LANGUAGES constant', () => {
  describe('structure', () => {
    it('should be an array', () => {
      // Arrange & Act
      const result = Array.isArray(LANGUAGES);

      // Assert
      expect(result).toBe(true);
    });

    it('should contain at least one language', () => {
      // Arrange & Act
      const result = LANGUAGES.length;

      // Assert
      expect(result).toBeGreaterThan(0);
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
  });

  describe('language objects', () => {
    it('should have correct structure for each language', () => {
      // Arrange & Act
      LANGUAGES.forEach((lang) => {
        // Assert
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

      // Act
      const uniqueCodes = new Set(codes);

      // Assert
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('type compatibility', () => {
    it('should be compatible with Language type', () => {
      // Arrange & Act
      const languages: Language[] = LANGUAGES;

      // Assert
      expect(languages).toBeDefined();
      expect(languages.length).toBe(LANGUAGES.length);
    });
  });
});

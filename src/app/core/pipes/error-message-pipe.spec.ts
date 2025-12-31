import { describe, it, expect, beforeEach } from 'vitest';
import { FormControl, Validators } from '@angular/forms';
import { ErrorMessagePipe } from './error-message-pipe';

describe('ErrorMessagePipe', () => {
  // Arrange
  let pipe: ErrorMessagePipe;

  beforeEach(() => {
    // Arrange: Create pipe instance directly
    pipe = new ErrorMessagePipe();
  });

  describe('transform', () => {
    it('should return empty string when field is null', () => {
      // Arrange
      const field = null;

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string when field has no errors', () => {
      // Arrange
      const field = new FormControl('valid value');

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toBe('');
    });

    it('should return required error message when field is required', () => {
      // Arrange
      const field = new FormControl('', [Validators.required]);

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toContain('required');
    });

    it('should return email error message when field has email error', () => {
      // Arrange
      const field = new FormControl('invalid-email', [Validators.email]);

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toContain('email');
    });

    it('should return min error message with value when field has min error', () => {
      // Arrange
      const field = new FormControl(5);
      field.setErrors({ min: { min: 10, actual: 5 } });

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toContain('10');
    });

    it('should return max error message with value when field has max error', () => {
      // Arrange
      const field = new FormControl(15);
      field.setErrors({ max: { max: 10, actual: 15 } });

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toContain('10');
    });

    it('should return minlength error message with required length', () => {
      // Arrange
      const field = new FormControl('ab', [Validators.minLength(5)]);

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toContain('5');
    });

    it('should return maxlength error message with required length', () => {
      // Arrange
      const field = new FormControl('abcdefghij', [Validators.maxLength(5)]);

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toContain('5');
    });

    it('should return nameTaken error message when field has nameTaken error', () => {
      // Arrange
      const field = new FormControl('existing-name');
      field.setErrors({ nameTaken: true });

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toContain('name');
    });

    it('should use custom message when provided in messages parameter', () => {
      // Arrange
      const field = new FormControl('', [Validators.required]);
      const customMessages = { required: 'Campo obligatorio personalizado' };

      // Act
      const result = pipe.transform(field, customMessages);

      // Assert
      expect(result).toBe('Campo obligatorio personalizado');
    });

    it('should use custom message for email error when provided', () => {
      // Arrange
      const field = new FormControl('invalid', [Validators.email]);
      const customMessages = { email: 'Email inválido personalizado' };

      // Act
      const result = pipe.transform(field, customMessages);

      // Assert
      expect(result).toBe('Email inválido personalizado');
    });

    it('should return first error message when field has multiple errors', () => {
      // Arrange
      const field = new FormControl('', [Validators.required, Validators.email]);

      // Act
      const result = pipe.transform(field);

      // Assert
      // Should return the first error (required)
      expect(result).toContain('required');
    });

    it('should handle field with errors object but empty keys', () => {
      // Arrange
      const field = new FormControl('value');
      field.setErrors({});

      // Act
      const result = pipe.transform(field);

      // Assert
      expect(result).toBe('');
    });
  });
});

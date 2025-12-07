import { ErrorMessagePipe } from './error-message-pipe';
import { FormControl } from '@angular/forms';

describe('ErrorMessagePipe', () => {
  let pipe: ErrorMessagePipe;

  beforeEach(() => {
    pipe = new ErrorMessagePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return empty string when control is null', () => {
      // Arrange & Act
      const result = pipe.transform(null);

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string when control has no errors', () => {
      // Arrange
      const control = new FormControl('valid value');

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toBe('');
    });

    it('should return error message for required field', () => {
      // Arrange
      const control = new FormControl('');
      control.setErrors({ required: true });
      control.markAsTouched();

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toContain('required');
    });

    it('should return error message for email field', () => {
      // Arrange
      const control = new FormControl('invalid-email');
      control.setErrors({ email: true });
      control.markAsTouched();

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toContain('email');
    });

    it('should return error message for minlength field', () => {
      // Arrange
      const control = new FormControl('ab');
      control.setErrors({ minlength: { requiredLength: 5, actualLength: 2 } });
      control.markAsTouched();

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toContain('5');
      expect(result).toContain('characters');
    });

    it('should return error message for maxlength field', () => {
      // Arrange
      const control = new FormControl('too long value');
      control.setErrors({ maxlength: { requiredLength: 10, actualLength: 15 } });
      control.markAsTouched();

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toContain('10');
      expect(result).toContain('maximum');
    });

    it('should return error message for min field', () => {
      // Arrange
      const control = new FormControl(5);
      control.setErrors({ min: { min: 10, actual: 5 } });
      control.markAsTouched();

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toContain('10');
      expect(result).toContain('greater');
    });

    it('should return error message for max field', () => {
      // Arrange
      const control = new FormControl(15);
      control.setErrors({ max: { max: 10, actual: 15 } });
      control.markAsTouched();

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toContain('10');
      expect(result).toContain('less');
    });

    it('should return error message for nameTaken field', () => {
      // Arrange
      const control = new FormControl('taken-name');
      control.setErrors({ nameTaken: true });
      control.markAsTouched();

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toContain('already in use');
    });

    it('should return custom message when provided', () => {
      // Arrange
      const control = new FormControl('test');
      control.setErrors({ customError: true });
      control.markAsTouched();
      const customMessages = { customError: 'Custom error message' };

      // Act
      const result = pipe.transform(control, customMessages);

      // Assert
      expect(result).toBe('Custom error message');
    });

    it('should return first error message when multiple errors exist', () => {
      // Arrange
      const control = new FormControl('');
      control.setErrors({ required: true, email: true });
      control.markAsTouched();

      // Act
      const result = pipe.transform(control);

      // Assert
      expect(result).toContain('required');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AilErrorHandler } from './ail-error-handler';
import { ApplicationInsightsLogging } from './application-insights-logging';

describe('AilErrorHandler', () => {
  let service: AilErrorHandler;
  let mockAil: Partial<ApplicationInsightsLogging>;

  beforeEach(() => {
    mockAil = {
      logException: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [AilErrorHandler, { provide: ApplicationInsightsLogging, useValue: mockAil }]
    });

    service = TestBed.inject(AilErrorHandler);
  });

  describe('handleError', () => {
    it('should log TypeError with severity 4', () => {
      // Arrange
      const error = new TypeError('Type error');

      // Act & Assert
      expect(() => service.handleError(error)).toThrow();
      expect(mockAil.logException).toHaveBeenCalledWith(error, 4);
    });

    it('should log ReferenceError with severity 4', () => {
      // Arrange
      const error = new ReferenceError('Reference error');

      // Act & Assert
      expect(() => service.handleError(error)).toThrow();
      expect(mockAil.logException).toHaveBeenCalledWith(error, 4);
    });

    it('should log SyntaxError with severity 4', () => {
      // Arrange
      const error = new SyntaxError('Syntax error');

      // Act & Assert
      expect(() => service.handleError(error)).toThrow();
      expect(mockAil.logException).toHaveBeenCalledWith(error, 4);
    });

    it('should log RangeError with severity 3', () => {
      // Arrange
      const error = new RangeError('Range error');

      // Act & Assert
      expect(() => service.handleError(error)).toThrow();
      expect(mockAil.logException).toHaveBeenCalledWith(error, 3);
    });

    it('should log generic Error with severity 3', () => {
      // Arrange
      const error = new Error('Generic error');

      // Act & Assert
      expect(() => service.handleError(error)).toThrow();
      expect(mockAil.logException).toHaveBeenCalledWith(error, 3);
    });

    it('should log unknown error type with severity 3', () => {
      // Arrange
      const error = { message: 'Unknown error' } as any;

      // Act & Assert
      expect(() => service.handleError(error)).toThrow();
      expect(mockAil.logException).toHaveBeenCalledWith(error, 3);
    });

    it('should rethrow the error', () => {
      // Arrange
      const error = new Error('Test error');

      // Act & Assert
      expect(() => service.handleError(error)).toThrow('Test error');
    });
  });
});

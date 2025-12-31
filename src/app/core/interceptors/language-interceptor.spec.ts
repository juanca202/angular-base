import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { languageInterceptor } from './language-interceptor';
import { AppManager } from '../services/app-manager';

describe('languageInterceptor', () => {
  // Arrange
  let appManager: AppManager;
  let mockHandler: HttpHandler;

  beforeEach(() => {
    // Arrange: Setup TestBed with AppManager
    TestBed.configureTestingModule({
      providers: [AppManager]
    });
    appManager = TestBed.inject(AppManager);
    mockHandler = {
      handle: vi.fn().mockReturnValue(of({}))
    } as any;
  });

  it('should add Accept-Language header with current locale', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test');
    const getLocaleSpy = vi.spyOn(appManager, 'getLocale').mockReturnValue('es');

    // Act
    languageInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      expect(getLocaleSpy).toHaveBeenCalled();
      const interceptedRequest = (mockHandler.handle as any).mock.calls[0][0];
      expect(interceptedRequest.headers.get('Accept-Language')).toBe('es');
      done();
    });
  });

  it('should use English locale when getLocale returns en', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test');
    vi.spyOn(appManager, 'getLocale').mockReturnValue('en');

    // Act
    languageInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      const interceptedRequest = (mockHandler.handle as any).mock.calls[0][0];
      expect(interceptedRequest.headers.get('Accept-Language')).toBe('en');
      done();
    });
  });

  it('should preserve existing headers', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test', null, {
      headers: { Authorization: 'Bearer token123' }
    });

    // Act
    languageInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      const interceptedRequest = (mockHandler.handle as any).mock.calls[0][0];
      expect(interceptedRequest.headers.get('Authorization')).toBe('Bearer token123');
      expect(interceptedRequest.headers.has('Accept-Language')).toBe(true);
      done();
    });
  });

  it('should call next handler with modified request', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test');
    const handleSpy = vi.spyOn(mockHandler, 'handle');

    // Act
    languageInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      expect(handleSpy).toHaveBeenCalledTimes(1);
      const interceptedRequest = handleSpy.mock.calls[0][0];
      expect(interceptedRequest).toBeInstanceOf(HttpRequest);
      expect(interceptedRequest.url).toBe(request.url);
      done();
    });
  });

  it('should update Accept-Language header when locale changes', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test');
    let callCount = 0;
    vi.spyOn(appManager, 'getLocale').mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 'en' : 'es';
    });

    // Act - First call
    languageInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert - First call
      const firstRequest = (mockHandler.handle as any).mock.calls[0][0];
      expect(firstRequest.headers.get('Accept-Language')).toBe('en');

      // Act - Second call
      languageInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
        // Assert - Second call
        const secondRequest = (mockHandler.handle as any).mock.calls[1][0];
        expect(secondRequest.headers.get('Accept-Language')).toBe('es');
        done();
      });
    });
  });
});

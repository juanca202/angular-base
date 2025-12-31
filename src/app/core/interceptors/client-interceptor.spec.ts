import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { clientInterceptor } from './client-interceptor';
import { AppManager } from '../services/app-manager';

describe('clientInterceptor', () => {
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

  it('should add Client-Id header to request', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test');
    const getClientIdSpy = vi.spyOn(appManager, 'getClientId').mockReturnValue('test-client-id');

    // Act
    clientInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      expect(getClientIdSpy).toHaveBeenCalled();
      const interceptedRequest = (mockHandler.handle as any).mock.calls[0][0];
      expect(interceptedRequest.headers.get('Client-Id')).toBe('test-client-id');
      done();
    });
  });

  it('should add App-Id header to request', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test');

    // Act
    clientInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      const interceptedRequest = (mockHandler.handle as any).mock.calls[0][0];
      expect(interceptedRequest.headers.has('App-Id')).toBe(true);
      done();
    });
  });

  it('should add App-Version header to request', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test');

    // Act
    clientInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      const interceptedRequest = (mockHandler.handle as any).mock.calls[0][0];
      expect(interceptedRequest.headers.has('App-Version')).toBe(true);
      done();
    });
  });

  it('should preserve existing headers', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test', null, {
      headers: { 'Custom-Header': 'custom-value' }
    });

    // Act
    clientInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      const interceptedRequest = (mockHandler.handle as any).mock.calls[0][0];
      expect(interceptedRequest.headers.get('Custom-Header')).toBe('custom-value');
      expect(interceptedRequest.headers.has('Client-Id')).toBe(true);
      done();
    });
  });

  it('should call next handler with modified request', (done) => {
    // Arrange
    const request = new HttpRequest('GET', '/api/test');
    const handleSpy = vi.spyOn(mockHandler, 'handle');

    // Act
    clientInterceptor(request, mockHandler.handle.bind(mockHandler)).subscribe(() => {
      // Assert
      expect(handleSpy).toHaveBeenCalledTimes(1);
      const interceptedRequest = handleSpy.mock.calls[0][0];
      expect(interceptedRequest).toBeInstanceOf(HttpRequest);
      expect(interceptedRequest.url).toBe(request.url);
      done();
    });
  });
});

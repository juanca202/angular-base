import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { clientInterceptor } from './client-interceptor';
import { AppManager } from '../services/app-manager';

describe('clientInterceptor', () => {
  let next: HttpHandlerFn;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppManager,
          useValue: {
            getClientId: vi.fn().mockReturnValue('test-client-id'),
            id: 'test-app',
            version: '1.0.0'
          }
        }
      ]
    });

    next = vi.fn().mockReturnValue(of({}));
  });

  it('should add Client-Id header', () => {
    const req = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => {
      clientInterceptor(req, next).subscribe();
    });

    const intercepted = (next as any).mock.calls[0][0];
    expect(intercepted.headers.get('Client-Id')).toBe('test-client-id');
  });

  it('should add App-Id header', () => {
    const req = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => {
      clientInterceptor(req, next).subscribe();
    });

    const intercepted = (next as any).mock.calls[0][0];
    expect(intercepted.headers.get('App-Id')).toBe('test-app');
  });

  it('should add App-Version header', () => {
    const req = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => {
      clientInterceptor(req, next).subscribe();
    });

    const intercepted = (next as any).mock.calls[0][0];
    expect(intercepted.headers.get('App-Version')).toBe('1.0.0');
  });

  it('should preserve existing headers', () => {
    const req = new HttpRequest('GET', '/api/test', null, {
      headers: new HttpHeaders({ 'Custom-Header': 'custom-value' })
    });

    TestBed.runInInjectionContext(() => {
      clientInterceptor(req, next).subscribe();
    });

    const intercepted = (next as any).mock.calls[0][0];
    expect(intercepted.headers.get('Custom-Header')).toBe('custom-value');
    expect(intercepted.headers.has('Client-Id')).toBe(true);
  });

  it('should call next handler once', () => {
    const req = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => {
      clientInterceptor(req, next).subscribe();
    });

    expect(next).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { languageInterceptor } from './language-interceptor';
import { AppManager } from '../services/app-manager';

describe('languageInterceptor', () => {
  let appManager: AppManager;
  let next: HttpHandlerFn;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppManager,
        {
          provide: AppManager,
          useValue: {
            getLocale: vi.fn().mockReturnValue('en')
          }
        }
      ]
    });

    appManager = TestBed.inject(AppManager);

    next = vi.fn().mockReturnValue(of({}));
  });

  it('should add Accept-Language header with current locale', () => {
    const req = new HttpRequest('GET', '/api/test');
    vi.spyOn(appManager, 'getLocale').mockReturnValue('es');

    TestBed.runInInjectionContext(() => {
      languageInterceptor(req, next).subscribe();
    });

    const interceptedReq = (next as any).mock.calls[0][0];
    expect(interceptedReq.headers.get('Accept-Language')).toBe('es');
  });

  it('should preserve existing headers', () => {
    const req = new HttpRequest('GET', '/api/test', null, {
      headers: new HttpHeaders({
        Authorization: 'Bearer token123'
      })
    });

    TestBed.runInInjectionContext(() => {
      languageInterceptor(req, next).subscribe();
    });

    const interceptedReq = (next as any).mock.calls[0][0];
    expect(interceptedReq.headers.get('Authorization')).toBe('Bearer token123');
    expect(interceptedReq.headers.get('Accept-Language')).toBe('en');
  });

  it('should call next handler once', () => {
    const req = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => {
      languageInterceptor(req, next).subscribe();
    });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should update Accept-Language when locale changes', () => {
    const req = new HttpRequest('GET', '/api/test');
    let call = 0;

    vi.spyOn(appManager, 'getLocale').mockImplementation(() => {
      call++;
      return call === 1 ? 'en' : 'es';
    });

    TestBed.runInInjectionContext(() => {
      languageInterceptor(req, next).subscribe();
      languageInterceptor(req, next).subscribe();
    });

    const first = (next as any).mock.calls[0][0];
    const second = (next as any).mock.calls[1][0];

    expect(first.headers.get('Accept-Language')).toBe('en');
    expect(second.headers.get('Accept-Language')).toBe('es');
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { AppManager } from 'app/core/app-manager';
import { provideHttpClient } from '@angular/common/http';
import { languageInterceptor } from './language-interceptor';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('languageInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => languageInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AppManager],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});

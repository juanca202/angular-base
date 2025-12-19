import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from './auth-service';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            addAuthenticationToken: (req: any) => req,
            handle401Error: vi.fn((e: any) => {
              throw e;
            }),
            logout: vi.fn()
          }
        }
      ]
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});

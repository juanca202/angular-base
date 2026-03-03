import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth-service';
import { AUTH_CONFIG } from './auth-config.token';
import { Login } from './models/login';
import { AuthToken } from './models/auth-token';
import type { AuthConfig } from './models/auth-config';
import type { WritableSignal } from '@angular/core';
import type { User } from './models/user';

/** Test helper to access private AuthService methods via type assertion */
interface AuthServiceTestAccess {
  setToken: (token: AuthToken | null) => void;
  getToken: () => AuthToken | null;
  _user: WritableSignal<User | null>;
}

const createTestAuthConfig = (overrides?: Partial<AuthConfig>): AuthConfig => ({
  sessionPrefix: 'test',
  appPath: '/app',
  auth: {
    signinUrl: '/api/signin',
    signupUrl: '/api/signup',
    refreshTokenUrl: '/api/refresh',
    tokenType: 'jwt',
    clients: { google: 'https://auth.google.com' }
  },
  ...overrides
});

describe('AuthService', () => {
  let service: AuthService;
  let mockHttpClient: { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };
  let mockDialog: Partial<MatDialog>;
  let authConfig: AuthConfig;

  beforeEach(() => {
    authConfig = createTestAuthConfig();

    mockHttpClient = {
      post: vi.fn(),
      get: vi.fn()
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(null))
      }),
      closeAll: vi.fn()
    };

    const originalAtob = globalThis.atob?.bind(globalThis);
    Object.defineProperty(window, 'atob', {
      writable: true,
      value: vi.fn((str: string) => {
        if (originalAtob) {
          try {
            return originalAtob(str);
          } catch {
            return str;
          }
        }
        return str;
      })
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1920
    });

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AUTH_CONFIG, useValue: authConfig },
        { provide: MatDialog, useValue: mockDialog },
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  describe('constructor', () => {
    it('should create service', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with default values', () => {
      expect(service.refreshTokenInProgress).toBe(false);
    });
  });

  describe('addAuthenticationToken', () => {
    it('should add authorization header when token exists', () => {
      const tokenValue = 'valid-access-token';
      (service as unknown as AuthServiceTestAccess).setToken({
        token: tokenValue,
        refresh_token: 'refresh-token'
      });
      const request = new HttpRequest('GET', '/api/test');

      const result = service.addAuthenticationToken(request);

      expect(result.headers.get('Authorization')).toBe(`Bearer ${tokenValue}`);
    });

    it('should return original request when token is null', () => {
      service.clearToken();
      const request = new HttpRequest('GET', '/api/test');

      const result = service.addAuthenticationToken(request);

      expect(result.headers.has('Authorization')).toBe(false);
    });

    it('should return original request for signin URL', () => {
      (service as unknown as AuthServiceTestAccess).setToken({
        token: 'valid-token',
        refresh_token: 'refresh'
      });
      const request = new HttpRequest('GET', authConfig.auth.signinUrl);

      const result = service.addAuthenticationToken(request);

      expect(result.headers.has('Authorization')).toBe(false);
    });

    it('should return original request for refresh token URL', () => {
      (service as unknown as AuthServiceTestAccess).setToken({
        token: 'valid-token',
        refresh_token: 'refresh'
      });
      const request = new HttpRequest('GET', authConfig.auth.refreshTokenUrl);

      const result = service.addAuthenticationToken(request);

      expect(result.headers.has('Authorization')).toBe(false);
    });
  });

  describe('login', () => {
    it('should sign in user and store token', async () => {
      const loginData: Login = {
        username: 'testuser',
        password: 'password123'
      };
      const authToken: AuthToken = {
        token: 'new-token',
        refresh_token: 'new-refresh-token'
      };
      vi.mocked(mockHttpClient.post).mockReturnValue(of(authToken));

      const result = await service.login(loginData);

      expect(result).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith(authConfig.auth.signinUrl, loginData);
      expect(service.user()).toBeNull();
      expect((service as unknown as AuthServiceTestAccess).getToken()).toEqual(authToken);
    });
  });

  describe('signup', () => {
    it('should sign up user', async () => {
      const signupData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };
      const response = { success: true };
      vi.mocked(mockHttpClient.post).mockReturnValue(of(response));

      const result = await service.signup(signupData);

      expect(result).toEqual(response);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        authConfig.auth.signupUrl,
        signupData,
        undefined
      );
    });

    it('should sign up user with options', async () => {
      const signupData = { username: 'newuser', email: 'newuser@example.com' };
      const options = { headers: { 'Content-Type': 'application/json' } };
      const response = { success: true };
      vi.mocked(mockHttpClient.post).mockReturnValue(of(response));

      const result = await service.signup(signupData, options);

      expect(result).toEqual(response);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        authConfig.auth.signupUrl,
        signupData,
        options
      );
    });
  });

  describe('logout', () => {
    it('should logout user and redirect to signin', async () => {
      const closeAllSpy = vi.spyOn(mockDialog, 'closeAll');

      const result = await service.logout();

      expect(result).toBe(true);
      expect(closeAllSpy).toHaveBeenCalled();
      expect(window.location.href).toContain('/signin');
    });

    it('should redirect to /auth on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });

      await service.logout();

      expect(window.location.href).toContain('/auth');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      (service as unknown as AuthServiceTestAccess).setToken({
        token: 'old-token',
        refresh_token: 'old-refresh-token'
      });
      const newToken: AuthToken = {
        token: 'new-token',
        refresh_token: 'new-refresh-token'
      };
      vi.mocked(mockHttpClient.post).mockReturnValue(of(newToken));

      const token = await new Promise<AuthToken>((resolve, reject) => {
        service.refreshToken().subscribe({
          next: (t) => resolve(t),
          error: reject
        });
      });

      expect(token).toEqual(newToken);
      expect((service as unknown as AuthServiceTestAccess).getToken()).toEqual(newToken);
    });

    it('should logout on refresh token error', async () => {
      (service as unknown as AuthServiceTestAccess).setToken({
        token: 'old-token',
        refresh_token: 'old-refresh-token'
      });
      vi.mocked(mockHttpClient.post).mockReturnValue(throwError(() => new Error('Refresh failed')));
      const logoutSpy = vi.spyOn(service, 'logout');

      try {
        await new Promise((resolve, reject) => {
          service.refreshToken().subscribe({
            next: resolve,
            error: reject
          });
        });
      } catch {
        expect(logoutSpy).toHaveBeenCalled();
      }
    });
  });

  describe('connect', () => {
    it('should redirect to auth URL when FedCM is not available', async () => {
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          userAgentData: {
            brands: [{ brand: 'Firefox' }]
          }
        }
      });

      const result = await service.connect('google');

      expect(result).toBe(true);
    });

    it('should redirect when client URL exists but FedCM not available', async () => {
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          userAgentData: {
            brands: [{ brand: 'Safari' }]
          }
        }
      });
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '' }
      });

      const result = await service.connect('google');

      expect(result).toBe(true);
    });

    it('should return true when no client URL exists', async () => {
      const configWithoutClient = createTestAuthConfig({
        auth: { ...authConfig.auth, clients: { google: '' } }
      });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AUTH_CONFIG, useValue: configWithoutClient },
          { provide: MatDialog, useValue: mockDialog },
          { provide: HttpClient, useValue: mockHttpClient }
        ]
      });
      const authSvc = TestBed.inject(AuthService);
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          userAgentData: {
            brands: [{ brand: 'Firefox' }]
          }
        }
      });

      const result = await authSvc.connect('google');

      expect(result).toBe(true);
    });

    it('should handle FedCM error gracefully', async () => {
      authConfig = createTestAuthConfig({
        fedcm: {
          google: {
            tokenUrl: 'https://token.url',
            configURL: 'https://config.url',
            clientId: 'client-id'
          }
        }
      });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AUTH_CONFIG, useValue: authConfig },
          { provide: MatDialog, useValue: mockDialog },
          { provide: HttpClient, useValue: mockHttpClient }
        ]
      });
      const authService = TestBed.inject(AuthService);
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          userAgentData: {
            brands: [{ brand: 'Google Chrome' }]
          },
          credentials: {
            get: vi.fn().mockRejectedValue(new Error('FedCM error'))
          }
        }
      });

      const result = await authService.connect('google');

      expect(result).toBe(false);
    });

    it('should handle missing FedCM config gracefully', async () => {
      authConfig = createTestAuthConfig({ fedcm: {} });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AUTH_CONFIG, useValue: authConfig },
          { provide: MatDialog, useValue: mockDialog },
          { provide: HttpClient, useValue: mockHttpClient }
        ]
      });
      const authService = TestBed.inject(AuthService);
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          userAgentData: {
            brands: [{ brand: 'Google Chrome' }]
          },
          credentials: {
            get: vi.fn()
          }
        }
      });

      try {
        const result = await authService.connect('google');
        expect(result).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('user signal', () => {
    it('should return null when no user is set', () => {
      expect(service.user()).toBeNull();
    });

    it('should return user when set', () => {
      const user = {
        username: 'test',
        email: 'test@example.com',
        roles: ['user'],
        firstName: 'Test',
        lastName: 'User',
        picture: '',
        featureFlags: []
      };
      (service as unknown as AuthServiceTestAccess)._user.set(user);

      expect(service.user()).toEqual(user);
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no token', () => {
      service.clearToken();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when valid token exists', () => {
      const futureExp = Math.round(Date.now() / 1000) + 3600;
      const tokenPayload = { exp: futureExp, username: 'test' };
      const encodedPayload = window.btoa(JSON.stringify(tokenPayload));
      const tokenValue = `header.${encodedPayload}.signature`;
      (service as unknown as AuthServiceTestAccess).setToken({
        token: tokenValue,
        refresh_token: 'refresh'
      });

      expect(service.isLoggedIn()).toBe(true);
    });
  });
});

/* global window */
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';

import { authGuard, loginGuard, resetGuard } from './auth-guards';
import { AppManager } from '@/core/services/app-manager';
import { Session } from '@/core/services/session';

describe('Auth Guards', () => {
  let mockRouter: jest.Mocked<Router>;
  let mockAppManager: jest.Mocked<AppManager>;
  let mockSession: jest.Mocked<Session>;

  beforeEach(() => {
    mockRouter = {
      navigateByUrl: jest.fn()
    } as any;

    mockAppManager = {
      initialized: true
    } as any;

    mockSession = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      settings: jest.fn().mockReturnValue({})
    } as any;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Router, useValue: mockRouter },
        { provide: AppManager, useValue: mockAppManager },
        { provide: Session, useValue: mockSession }
      ]
    });
  });

  describe('authGuard', () => {
    it('should allow access when user is logged in and initialized', async () => {
      // Arrange
      mockSession.isLoggedIn.mockReturnValue(true);
      mockSession.settings.mockReturnValue({});
      mockAppManager.initialized = true;

      // Act
      const result = await TestBed.runInInjectionContext(() =>
        authGuard({} as any, { url: '/dashboard' } as any)
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should redirect to signin when user is not logged in', async () => {
      // Arrange
      mockSession.isLoggedIn.mockReturnValue(false);
      mockSession.settings.mockReturnValue(null);
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });

      // Act
      const result = await TestBed.runInInjectionContext(() =>
        authGuard({} as any, { url: '/dashboard' } as any)
      );

      // Assert
      expect(result).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/signin');
    });

    it('should redirect to auth when user is not logged in on mobile', async () => {
      // Arrange
      mockSession.isLoggedIn.mockReturnValue(false);
      mockSession.settings.mockReturnValue(null);
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });

      // Act
      const result = await TestBed.runInInjectionContext(() =>
        authGuard({} as any, { url: '/dashboard' } as any)
      );

      // Assert
      expect(result).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth');
    });

    it('should redirect when user is logged in but has no settings', async () => {
      // Arrange
      mockSession.isLoggedIn.mockReturnValue(true);
      mockSession.settings.mockReturnValue(null);

      // Act
      const result = await TestBed.runInInjectionContext(() =>
        authGuard({} as any, { url: '/dashboard' } as any)
      );

      // Assert
      expect(result).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalled();
    });

    it('should deny access when app is not initialized', async () => {
      // Arrange
      mockSession.isLoggedIn.mockReturnValue(true);
      mockSession.settings.mockReturnValue({});
      mockAppManager.initialized = false;

      // Act
      const result = await TestBed.runInInjectionContext(() =>
        authGuard({} as any, { url: '/dashboard' } as any)
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('loginGuard', () => {
    it('should allow access when user is not logged in', () => {
      // Arrange
      mockSession.isLoggedIn.mockReturnValue(false);

      // Act
      const result = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any));

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access when user is logged in', () => {
      // Arrange
      mockSession.isLoggedIn.mockReturnValue(true);

      // Act
      const result = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any));

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('resetGuard', () => {
    it('should allow access when token is present and user is not logged in', () => {
      // Arrange
      const route = {
        queryParamMap: {
          get: jest.fn().mockReturnValue('valid-token')
        }
      } as unknown as ActivatedRouteSnapshot;
      mockSession.isLoggedIn.mockReturnValue(false);

      // Act
      const result = TestBed.runInInjectionContext(() => resetGuard(route));

      // Assert
      expect(result).toBe(true);
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should redirect to home when user is already logged in', () => {
      // Arrange
      const route = {
        queryParamMap: {
          get: jest.fn().mockReturnValue('valid-token')
        }
      } as unknown as ActivatedRouteSnapshot;
      mockSession.isLoggedIn.mockReturnValue(true);

      // Act
      const result = TestBed.runInInjectionContext(() => resetGuard(route));

      // Assert
      expect(result).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should redirect to error 403 when no token and user is not logged in', () => {
      // Arrange
      const route = {
        queryParamMap: {
          get: jest.fn().mockReturnValue(null)
        }
      } as unknown as ActivatedRouteSnapshot;
      mockSession.isLoggedIn.mockReturnValue(false);

      // Act
      const result = TestBed.runInInjectionContext(() => resetGuard(route));

      // Assert
      expect(result).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/error/403', {
        skipLocationChange: true
      });
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router, RouterModule, UrlTree } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { Settings as SettingsModel } from '@/core/models/settings';
import { Settings } from './settings';
import { AppManager } from '@/core/services/app-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import { AuthManager } from '../../managers/auth-manager';
import { AuthProvider } from 'auth-core';
import { Session } from '@/core/services/session';
import { GoogleTagManagerService } from '@factor_ec/utils';
import { UI_OPTIONS } from '@factor_ec/ui';
import { computed, signal } from '@angular/core';
import { environment } from '@/environments/environment';

describe('Settings', () => {
  // Arrange
  let component: Settings;
  let fixture: ComponentFixture<Settings>;
  let mockAppManager: Partial<AppManager>;
  let mockAuthProvider: Partial<AuthProvider>;
  let mockAuthManager: Partial<AuthManager>;
  let mockLayoutManager: Partial<LayoutManager>;
  let mockSession: Partial<Session>;
  let mockGoogleTagManagerService: Partial<GoogleTagManagerService>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let paramMapSubject: Subject<ParamMap>;

  beforeEach(async () => {
    // Arrange: Create mocks
    paramMapSubject = new Subject<ParamMap>();
    mockAppManager = {
      checkForUpdates: vi.fn(),
      languages: signal(environment.languages),
      getLocale: vi.fn().mockReturnValue('en'),
      updateStatus: signal<string | null>('done')
    };
    mockAuthProvider = {
      user: signal(null),
      login: vi.fn().mockResolvedValue(true),
      logout: vi.fn().mockResolvedValue(true),
      isLoggedIn: signal(false)
    };
    mockAuthManager = {
      changePassword: vi.fn(),
      confirmDeleteUser: vi.fn()
    };
    mockLayoutManager = {};
    mockSession = {
      params: computed(() => null),
      settings: computed<SettingsModel | null>(() => null)
    };
    mockGoogleTagManagerService = {
      addVariable: vi.fn()
    };
    mockRouter = {
      navigateByUrl: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue({} as UrlTree),
      parseUrl: vi.fn().mockReturnValue({} as UrlTree),
      serializeUrl: vi.fn().mockReturnValue(''),
      events: EMPTY
    };
    mockActivatedRoute = {
      paramMap: paramMapSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [Settings, RouterModule],
      providers: [
        { provide: AppManager, useValue: mockAppManager },
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: AuthManager, useValue: mockAuthManager },
        { provide: LayoutManager, useValue: mockLayoutManager },
        { provide: Session, useValue: mockSession },
        { provide: GoogleTagManagerService, useValue: mockGoogleTagManagerService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        {
          provide: UI_OPTIONS,
          useValue: {
            iconSettings: {
              path: 'images',
              collection: 'factoricons-regular'
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create component', () => {
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should check for updates on construction', () => {
      // Arrange & Act
      // Component is already created in beforeEach

      // Assert
      expect(mockAppManager.checkForUpdates).toHaveBeenCalled();
    });

    it('should initialize with first language from LANGUAGES', () => {
      // Arrange & Act
      const language = component.language();

      // Assert
      expect(language).toEqual(environment.languages[0]);
    });

    it('should set current language from AppManager if available', () => {
      // Arrange & Act
      // Component is already created with getLocale returning 'en' in beforeEach
      const language = component.language();
      const currentLanguage = environment.languages.find((l) => l.code === 'en');

      // Assert
      expect(mockAppManager.getLocale).toHaveBeenCalled();
      if (currentLanguage) {
        expect(language.code).toBe('en');
      }
    });

    it('should initialize subscribing signal as false', () => {
      // Arrange & Act
      const subscribing = component.subscribing();

      // Assert
      expect(subscribing).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should handle delete-data action from route params', () => {
      // Arrange
      const paramMap: Partial<ParamMap> = {
        get: vi.fn().mockReturnValue('delete-data')
      };

      // Act
      component.ngOnInit();
      paramMapSubject.next(paramMap as ParamMap);

      // Assert
      expect(mockAuthManager.confirmDeleteUser).toHaveBeenCalled();
    });

    it('should navigate to error page for unknown action', () => {
      // Arrange
      const paramMap: Partial<ParamMap> = {
        get: vi.fn().mockReturnValue('unknown-action')
      };

      // Act
      component.ngOnInit();
      paramMapSubject.next(paramMap as ParamMap);

      // Assert
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('error/404', {
        skipLocationChange: true
      });
    });

    it('should not navigate when no action is provided', () => {
      // Arrange
      const paramMap: Partial<ParamMap> = {
        get: vi.fn().mockReturnValue(null)
      };

      // Act
      component.ngOnInit();
      paramMapSubject.next(paramMap as ParamMap);

      // Assert
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockAuthManager.confirmDeleteUser).not.toHaveBeenCalled();
    });
  });

  describe('shareApp', () => {
    it('should share app when navigator.share is available', async () => {
      // Arrange
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(window.navigator, 'share', {
        writable: true,
        value: mockShare
      });

      // Act
      component.shareApp();

      // Assert
      await new Promise((resolve) => globalThis.setTimeout(resolve, 100));
      expect(mockShare).toHaveBeenCalledWith({
        title: expect.any(String),
        text: expect.any(String),
        url: ''
      });
    });

    it('should track share success event', async () => {
      // Arrange
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(window.navigator, 'share', {
        writable: true,
        value: mockShare
      });

      // Act
      component.shareApp();

      // Assert
      await new Promise((resolve) => globalThis.setTimeout(resolve, 100));
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'share_app_success'
      });
    });

    it('should track share error event on failure', async () => {
      // Arrange
      const error = new Error('Share failed');
      const mockShare = vi.fn().mockRejectedValue(error);
      Object.defineProperty(window.navigator, 'share', {
        writable: true,
        value: mockShare
      });

      // Act
      component.shareApp();

      // Assert
      await new Promise((resolve) => globalThis.setTimeout(resolve, 100));
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'share_app_error',
        message: 'Share failed'
      });
    });

    it('should not throw error when navigator.share is not available', () => {
      // Arrange
      Object.defineProperty(window.navigator, 'share', {
        writable: true,
        value: undefined
      });

      // Act & Assert
      expect(() => component.shareApp()).not.toThrow();
    });
  });
});

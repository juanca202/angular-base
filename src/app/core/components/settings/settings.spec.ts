import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { Settings } from './settings';
import { AppManager } from '@/core/services/app-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import { AuthProvider } from '@/core/services/auth.provider';
import { Session } from '@/core/services/session';
import { GoogleTagManagerService } from '@factor_ec/utils';
import { LANGUAGES } from '@/core/constants/languages';

describe('Settings', () => {
  // Arrange
  let component: Settings;
  let fixture: ComponentFixture<Settings>;
  let mockAppManager: Partial<AppManager>;
  let mockAuthService: Partial<AuthProvider>;
  let mockLayoutManager: Partial<LayoutManager>;
  let mockSession: Partial<Session>;
  let mockGoogleTagManagerService: Partial<GoogleTagManagerService>;
  let mockTitle: Title;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let paramMapSubject: Subject<ParamMap>;

  beforeEach(async () => {
    // Arrange: Create mocks
    paramMapSubject = new Subject<ParamMap>();
    mockAppManager = {
      checkForUpdates: vi.fn(),
      languages: vi.fn().mockReturnValue(LANGUAGES),
      getLocale: vi.fn().mockReturnValue('en'),
      updateStatus: vi.fn().mockReturnValue('done'),
      name: 'Test App',
      version: '1.0.0'
    };
    mockAuthService = {
      changePassword: vi.fn(),
      confirmDeleteUser: vi.fn(),
      logout: vi.fn()
    };
    mockLayoutManager = {};
    mockSession = {
      user: vi.fn().mockReturnValue(null),
      settings: vi.fn().mockReturnValue(null)
    };
    mockGoogleTagManagerService = {
      addVariable: vi.fn()
    };
    mockTitle = {
      setTitle: vi.fn()
    } as any;
    mockRouter = {
      navigateByUrl: vi.fn()
    };
    mockActivatedRoute = {
      paramMap: paramMapSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [Settings, RouterModule],
      providers: [
        { provide: AppManager, useValue: mockAppManager },
        { provide: AuthProvider, useValue: mockAuthService },
        { provide: LayoutManager, useValue: mockLayoutManager },
        { provide: Session, useValue: mockSession },
        { provide: GoogleTagManagerService, useValue: mockGoogleTagManagerService },
        { provide: Title, useValue: mockTitle },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
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

    it('should set title on construction', () => {
      // Arrange & Act
      // Component is already created in beforeEach

      // Assert
      expect(mockTitle.setTitle).toHaveBeenCalled();
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
      expect(language).toEqual(LANGUAGES[0]);
    });

    it('should set current language from AppManager if available', () => {
      // Arrange
      const currentLanguage = LANGUAGES.find((l) => l.code === 'en');
      mockAppManager.getLocale = vi.fn().mockReturnValue('en');

      // Act
      // Component is already created, but we can check the language
      const language = component.language();

      // Assert
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
      expect(mockAuthService.confirmDeleteUser).toHaveBeenCalled();
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
      expect(mockAuthService.confirmDeleteUser).not.toHaveBeenCalled();
    });
  });

  describe('shareApp', () => {
    it('should share app when navigator.share is available', async () => {
      // Arrange
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: mockShare
      });

      // Act
      component.shareApp();

      // Assert
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockShare).toHaveBeenCalledWith({
        title: expect.any(String),
        text: expect.any(String),
        url: ''
      });
    });

    it('should track share success event', async () => {
      // Arrange
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: mockShare
      });

      // Act
      component.shareApp();

      // Assert
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'share_app_success'
      });
    });

    it('should track share error event on failure', async () => {
      // Arrange
      const error = new Error('Share failed');
      const mockShare = vi.fn().mockRejectedValue(error);
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: mockShare
      });

      // Act
      component.shareApp();

      // Assert
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'share_app_error',
        message: 'Share failed'
      });
    });

    it('should not throw error when navigator.share is not available', () => {
      // Arrange
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: undefined
      });

      // Act & Assert
      expect(() => component.shareApp()).not.toThrow();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, type WritableSignal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate, type VersionEvent } from '@angular/service-worker';
import { EventEmitter } from '@angular/core';
import { AppManager } from '@/core/services/app-manager';
import { AuthProvider } from '@factor_ec/utils';
import { Session } from '@/core/services/session';
import { GoogleTagManager, Storage } from '@factor_ec/utils';
import { environment } from '@/environments/environment';
import { notificationEvents } from '@/core/utils/notification';
import {
  createMockAuthProvider,
  createMockSession,
  createMockGoogleTagManagerService,
  createMockMatSnackBar,
  createMockSwUpdate,
  createMockMessageServiceProvider
} from '@/test/mocks/service-mocks';
import { createMockStorageService } from '@/test/mocks/angular-mocks';

/** Acceso tipado a miembros privados de AppManager, solo para pruebas. */
type AppManagerPrivate = {
  installPrompt: { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null;
  loadTranslationsForLocale: (locale: string) => Promise<void>;
};

describe('AppManager', () => {
  let appManager: AppManager;
  let mockAuthProvider: Partial<AuthProvider>;
  let mockSession: Partial<Session>;
  let mockStorage: Partial<Storage>;
  let mockGoogleTagManager: Partial<GoogleTagManager>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockSwUpdate: Partial<SwUpdate>;
  let mockMessageServiceProvider: ReturnType<typeof createMockMessageServiceProvider>;
  let mockMessageService: ReturnType<typeof createMockMessageServiceProvider>['useValue'];

  beforeEach(() => {
    // Arrange: Create mocks
    mockAuthProvider = createMockAuthProvider();
    mockSession = createMockSession();
    mockStorage = createMockStorageService();
    mockGoogleTagManager = createMockGoogleTagManagerService();
    mockSnackBar = createMockMatSnackBar();
    mockSwUpdate = createMockSwUpdate();
    mockMessageServiceProvider = createMockMessageServiceProvider();
    mockMessageService = mockMessageServiceProvider.useValue;

    TestBed.configureTestingModule({
      providers: [
        AppManager,
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: Session, useValue: mockSession },
        { provide: Storage, useValue: mockStorage },
        { provide: GoogleTagManager, useValue: mockGoogleTagManager },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: SwUpdate, useValue: mockSwUpdate },
        mockMessageServiceProvider,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    appManager = TestBed.inject(AppManager);
  });

  describe('properties', () => {
    it('should have languages signal', () => {
      // Arrange & Act
      const languages = appManager.languages();

      // Assert
      expect(languages).toEqual(environment.i18n.languages);
    });

    it('should have updateStatus signal', () => {
      // Arrange & Act
      const status = appManager.updateStatus();

      // Assert
      expect(status).toBe('done');
    });
  });

  describe('getClientId', () => {
    it('should generate new client ID if not exists', () => {
      // Arrange
      vi.mocked(mockStorage.get!).mockReturnValue(null);
      const setSpy = vi.spyOn(mockStorage, 'set');

      // Act
      const clientId = appManager.getClientId();

      // Assert
      expect(clientId).toBeDefined();
      expect(typeof clientId).toBe('string');
      expect(setSpy).toHaveBeenCalled();
    });

    it('should return existing client ID from storage', () => {
      // Arrange
      const existingId = 'existing-client-id';
      vi.mocked(mockStorage.get!).mockReturnValue(existingId);

      // Act
      const clientId = appManager.getClientId();

      // Assert
      expect(clientId).toBe(existingId);
      expect(mockStorage.get).toHaveBeenCalled();
    });
  });

  describe('getLocale', () => {
    it('should return locale from storage', () => {
      // Arrange
      vi.mocked(mockStorage.get!).mockReturnValue('es');

      // Act
      const locale = appManager.getLocale();

      // Assert
      expect(locale).toBe('es');
    });

    it('should return default locale if not in storage', () => {
      // Arrange
      vi.mocked(mockStorage.get!).mockReturnValue(null);

      // Act
      const locale = appManager.getLocale();

      // Assert
      expect(locale).toBe('en');
    });
  });

  describe('checkForUpdates', () => {
    it('should check for updates when service worker is enabled', () => {
      // Arrange
      (mockSwUpdate as unknown as { isEnabled: boolean }).isEnabled = true;
      const checkSpy = vi.spyOn(mockSwUpdate, 'checkForUpdate');

      // Act
      appManager.checkForUpdates();

      // Assert
      expect(appManager.updateStatus()).toBe('checking');
      expect(checkSpy).toHaveBeenCalled();
    });

    it('should set status to failed when service worker is disabled', () => {
      // Arrange
      (mockSwUpdate as unknown as { isEnabled: boolean }).isEnabled = false;

      // Act
      appManager.checkForUpdates();

      // Assert
      expect(appManager.updateStatus()).toBe('failed');
    });
  });

  describe('install', () => {
    it('should prompt install when installPrompt exists', () => {
      // Arrange
      const mockPrompt = vi.fn();
      const mockUserChoice = Promise.resolve({ outcome: 'accepted' });
      (appManager as unknown as AppManagerPrivate).installPrompt = {
        prompt: mockPrompt,
        userChoice: mockUserChoice
      };

      // Act
      appManager.install();

      // Assert
      expect(mockPrompt).toHaveBeenCalled();
    });

    it('should not prompt when installPrompt is null', () => {
      // Arrange
      (appManager as unknown as AppManagerPrivate).installPrompt = null;

      // Act
      appManager.install();

      // Assert
      // Should not throw error
      // Should not throw error when installPrompt is null
      expect(() => appManager.install()).not.toThrow();
    });
  });

  describe('init', () => {
    // Note: init() method involves dynamic imports and complex async flows
    // These are better tested in integration tests. Unit tests focus on
    // individual method behaviors that can be isolated.
    it('should be callable', () => {
      // Arrange & Act & Assert
      expect(typeof appManager.init).toBe('function');
    });

    it('should not load translations when environment.i18n.enabled is false', async () => {
      // Arrange
      const originalEnabled = environment.i18n.enabled;
      environment.i18n.enabled = false;
      vi.mocked(mockStorage.get!).mockReturnValue(null);
      const loadSpy = vi.spyOn(appManager as unknown as AppManagerPrivate, 'loadTranslationsForLocale');

      // Act
      await appManager.init();

      // Assert
      expect(loadSpy).not.toHaveBeenCalled();

      // Cleanup
      environment.i18n.enabled = originalEnabled;
    });

    it('should load translations when environment.i18n.enabled is true', async () => {
      // Arrange
      const originalEnabled = environment.i18n.enabled;
      environment.i18n.enabled = true;
      vi.mocked(mockStorage.get!).mockReturnValue(null);
      const loadSpy = vi.spyOn(appManager as unknown as AppManagerPrivate, 'loadTranslationsForLocale');

      // Act
      await appManager.init();

      // Assert
      expect(loadSpy).toHaveBeenCalled();

      // Cleanup
      environment.i18n.enabled = originalEnabled;
    });
  });

  describe('versionUpdates subscription', () => {
    it('should handle VERSION_DETECTED event', () => {
      // Arrange
      const versionUpdates = new EventEmitter<VersionEvent>();
      const swUpdateWithEmitter = {
        ...mockSwUpdate,
        versionUpdates,
        isEnabled: false
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AppManager,
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Session, useValue: mockSession },
          { provide: Storage, useValue: mockStorage },
          { provide: GoogleTagManager, useValue: mockGoogleTagManager },
          { provide: MatSnackBar, useValue: mockSnackBar },
          { provide: SwUpdate, useValue: swUpdateWithEmitter },
          mockMessageServiceProvider,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const manager = TestBed.inject(AppManager);
      void manager.init();

      // Act
      versionUpdates.emit({ type: 'VERSION_DETECTED', version: { hash: 'abc123' } });

      // Assert
      expect(manager.updateStatus()).toBe('checking');
    });

    it('should handle VERSION_READY event', () => {
      // Arrange
      const versionUpdates = new EventEmitter<VersionEvent>();
      const snackBarOpenSpy = vi.spyOn(mockSnackBar, 'open').mockReturnValue({
        onAction: vi.fn().mockReturnValue({
          subscribe: vi.fn((callback: () => void) => {
            callback();
            return { unsubscribe: vi.fn() };
          })
        })
      } as unknown as ReturnType<MatSnackBar['open']>);
      const swUpdateWithEmitter = {
        ...mockSwUpdate,
        versionUpdates,
        isEnabled: false
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AppManager,
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Session, useValue: mockSession },
          { provide: Storage, useValue: mockStorage },
          { provide: GoogleTagManager, useValue: mockGoogleTagManager },
          { provide: MatSnackBar, useValue: mockSnackBar },
          { provide: SwUpdate, useValue: swUpdateWithEmitter },
          mockMessageServiceProvider,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const manager = TestBed.inject(AppManager);
      void manager.init();
      Object.defineProperty(window, 'location', {
        writable: true,
        configurable: true,
        value: {
          ...window.location,
          reload: vi.fn()
        }
      });

      // Act
      versionUpdates.emit({
        type: 'VERSION_READY',
        currentVersion: { hash: 'abc123' },
        latestVersion: { hash: 'def456' }
      });

      // Assert
      expect(manager.updateStatus()).toBe('done');
      expect(snackBarOpenSpy).toHaveBeenCalled();
    });

    it('should handle VERSION_INSTALLATION_FAILED event', () => {
      // Arrange
      const versionUpdates = new EventEmitter<VersionEvent>();
      const swUpdateWithEmitter = {
        ...mockSwUpdate,
        versionUpdates,
        isEnabled: false
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AppManager,
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Session, useValue: mockSession },
          { provide: Storage, useValue: mockStorage },
          { provide: GoogleTagManager, useValue: mockGoogleTagManager },
          { provide: MatSnackBar, useValue: mockSnackBar },
          { provide: SwUpdate, useValue: swUpdateWithEmitter },
          mockMessageServiceProvider,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const manager = TestBed.inject(AppManager);
      void manager.init();

      // Act
      versionUpdates.emit({
        type: 'VERSION_INSTALLATION_FAILED',
        version: { hash: 'abc123' },
        error: 'Installation failed'
      });

      // Assert
      expect(manager.updateStatus()).toBe('failed');
    });

    it('should handle NO_NEW_VERSION_DETECTED event', () => {
      // Arrange
      const versionUpdates = new EventEmitter<VersionEvent>();
      const swUpdateWithEmitter = {
        ...mockSwUpdate,
        versionUpdates,
        isEnabled: false
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AppManager,
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Session, useValue: mockSession },
          { provide: Storage, useValue: mockStorage },
          { provide: GoogleTagManager, useValue: mockGoogleTagManager },
          { provide: MatSnackBar, useValue: mockSnackBar },
          { provide: SwUpdate, useValue: swUpdateWithEmitter },
          mockMessageServiceProvider,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const manager = TestBed.inject(AppManager);
      void manager.init();

      // Act
      versionUpdates.emit({ type: 'NO_NEW_VERSION_DETECTED', version: { hash: 'abc123' } });

      // Assert
      expect(manager.updateStatus()).toBe('done');
    });
  });

  describe('notify/confirm event listeners', () => {
    it('should build message options for each notify level', async () => {
      // Arrange
      void appManager.init();
      const cases: Array<{ level?: 'success' | 'error' | 'warning' | 'info'; expected: object }> = [
        { level: 'success', expected: { class: 'ft-message--success', icon: 'check--circle' } },
        { level: 'error', expected: { class: 'ft-message--error' } },
        { level: 'warning', expected: { class: 'ft-message--warning' } },
        { level: 'info', expected: { class: 'ft-message--info' } },
        { expected: {} }
      ];

      // Act
      for (const { level } of cases) {
        notificationEvents.dispatchEvent(
          new CustomEvent('notify', {
            detail: { message: 'msg', options: level ? { level } : undefined }
          })
        );
      }

      // Assert
      expect(mockMessageService.show).toHaveBeenCalledTimes(cases.length);
      cases.forEach(({ expected }, index) => {
        expect(vi.mocked(mockMessageService.show!).mock.calls[index][1]).toEqual(
          expect.objectContaining({ type: 'notification', ...expected })
        );
      });
    });

    it('should honor a modal presentation type on notify events', () => {
      // Arrange
      void appManager.init();

      // Act
      notificationEvents.dispatchEvent(
        new CustomEvent('notify', { detail: { message: 'msg', options: { type: 'modal' } } })
      );

      // Assert
      expect(vi.mocked(mockMessageService.show!).mock.calls[0][1]).toEqual(
        expect.objectContaining({ type: 'modal' })
      );
    });

    it('should resolve a confirm event through MessageService', async () => {
      // Arrange
      void appManager.init();
      const resolve = vi.fn();

      // Act
      notificationEvents.dispatchEvent(
        new CustomEvent('confirm', {
          detail: { message: 'Are you sure?', options: { class: 'c', icon: 'i' }, resolve }
        })
      );

      // Assert
      await vi.waitFor(() => expect(resolve).toHaveBeenCalled());
      expect(vi.mocked(mockMessageService.show!).mock.calls[0]).toEqual([
        'Are you sure?',
        expect.objectContaining({ type: 'modal', class: 'c', icon: 'i' })
      ]);
    });
  });

  describe('init with a logged-in user', () => {
    it('should fetch session settings when the user is already authenticated', async () => {
      // Arrange
      const getSettingsSpy = vi.spyOn(mockSession as Required<Session>, 'getSettings');
      (mockAuthProvider.isLoggedIn as unknown as WritableSignal<boolean>).set(true);

      // Act
      await appManager.init();

      // Assert
      expect(getSettingsSpy).toHaveBeenCalled();
    });
  });

  describe('beforeinstallprompt', () => {
    it('should capture the install prompt event on the browser platform', () => {
      // Arrange
      void appManager.init();
      const preventDefault = vi.fn();
      const prompt = vi.fn();

      // Act
      window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), { preventDefault, prompt }));
      appManager.install();

      // Assert
      expect(preventDefault).toHaveBeenCalled();
      expect(prompt).toHaveBeenCalled();
    });
  });
});

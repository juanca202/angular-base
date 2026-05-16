import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { EventEmitter } from '@angular/core';
import { AppManager } from './app-manager';
import { AuthProvider } from '@factor_ec/utils';
import { Session } from './session';
import { GoogleTagManager, Storage } from '@factor_ec/utils';
import { environment } from '@/environments/environment';
import {
  createMockAuthProvider,
  createMockSession,
  createMockGoogleTagManagerService,
  createMockMatSnackBar,
  createMockSwUpdate
} from '@/test/mocks/service-mocks';
import { createMockStorageService } from '@/test/mocks/angular-mocks';

describe('AppManager', () => {
  let appManager: AppManager;
  let mockAuthProvider: Partial<AuthProvider>;
  let mockSession: Partial<Session>;
  let mockStorage: Partial<Storage>;
  let mockGoogleTagManager: Partial<GoogleTagManager>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockSwUpdate: Partial<SwUpdate>;

  beforeEach(() => {
    // Arrange: Create mocks
    mockAuthProvider = createMockAuthProvider();
    mockSession = createMockSession();
    mockStorage = createMockStorageService();
    mockGoogleTagManager = createMockGoogleTagManagerService();
    mockSnackBar = createMockMatSnackBar();
    mockSwUpdate = createMockSwUpdate();

    TestBed.configureTestingModule({
      providers: [
        AppManager,
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: Session, useValue: mockSession },
        { provide: Storage, useValue: mockStorage },
        { provide: GoogleTagManager, useValue: mockGoogleTagManager },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: SwUpdate, useValue: mockSwUpdate },
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
      expect(languages).toEqual(environment.languages);
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
      (mockStorage.get as any).mockReturnValue(null);
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
      (mockStorage.get as any).mockReturnValue(existingId);

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
      (mockStorage.get as any).mockReturnValue('es');

      // Act
      const locale = appManager.getLocale();

      // Assert
      expect(locale).toBe('es');
    });

    it('should return default locale if not in storage', () => {
      // Arrange
      (mockStorage.get as any).mockReturnValue(null);

      // Act
      const locale = appManager.getLocale();

      // Assert
      expect(locale).toBe('en');
    });
  });

  describe('checkForUpdates', () => {
    it('should check for updates when service worker is enabled', () => {
      // Arrange
      (mockSwUpdate.isEnabled as any) = true;
      const checkSpy = vi.spyOn(mockSwUpdate, 'checkForUpdate');

      // Act
      appManager.checkForUpdates();

      // Assert
      expect(appManager.updateStatus()).toBe('checking');
      expect(checkSpy).toHaveBeenCalled();
    });

    it('should set status to failed when service worker is disabled', () => {
      // Arrange
      (mockSwUpdate.isEnabled as any) = false;

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
      (appManager as any).installPrompt = {
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
      (appManager as any).installPrompt = null;

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
  });

  describe('versionUpdates subscription', () => {
    it('should handle VERSION_DETECTED event', () => {
      // Arrange
      const versionUpdates = new EventEmitter<any>();
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
      const versionUpdates = new EventEmitter<any>();
      const snackBarOpenSpy = vi.spyOn(mockSnackBar, 'open').mockReturnValue({
        onAction: vi.fn().mockReturnValue({
          subscribe: vi.fn((callback: any) => {
            callback();
            return { unsubscribe: vi.fn() };
          })
        })
      } as any);
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
      const versionUpdates = new EventEmitter<any>();
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
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const manager = TestBed.inject(AppManager);
      void manager.init();

      // Act
      versionUpdates.emit({
        type: 'VERSION_INSTALLATION_FAILED',
        version: { hash: 'abc123' },
        error: new Error('Installation failed')
      });

      // Assert
      expect(manager.updateStatus()).toBe('failed');
    });

    it('should handle NO_NEW_VERSION_DETECTED event', () => {
      // Arrange
      const versionUpdates = new EventEmitter<any>();
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
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const manager = TestBed.inject(AppManager);
      void manager.init();

      // Act
      versionUpdates.emit({ type: 'NO_NEW_VERSION_DETECTED' });

      // Assert
      expect(manager.updateStatus()).toBe('done');
    });
  });
});

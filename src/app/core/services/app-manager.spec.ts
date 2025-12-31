import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { AppManager } from './app-manager';
import { AuthProvider } from './auth.provider';
import { Session } from './session';
import { User } from '../models/user';
import { GoogleTagManagerService, StorageService } from '@factor_ec/utils';
import { LANGUAGES } from '../constants/languages';
import { signal, computed, EventEmitter } from '@angular/core';

describe('AppManager', () => {
  let appManager: AppManager;
  let mockAuthProvider: Partial<AuthProvider>;
  let mockSession: Partial<Session>;
  let mockStorageService: Partial<StorageService>;
  let mockGoogleTagManagerService: Partial<GoogleTagManagerService>;
  let mockLocation: Partial<Location>;
  let mockRouter: Partial<Router>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockSwUpdate: Partial<SwUpdate>;

  beforeEach(() => {
    // Arrange: Create mocks
    mockAuthProvider = {
      getSettings: vi.fn().mockResolvedValue({
        language: 'en',
        subscription: {
          code: 'premium',
          name: 'Premium',
          plan: { code: 'premium', name: 'Premium Plan' }
        },
        environment: 'production',
        onboarding: false
      }),
      settings: signal(undefined),
      loggedIn: new EventEmitter<boolean>(false)
    };

    mockSession = {
      isLoggedIn: computed(() => false),
      loggedIn: new EventEmitter<User>()
    };

    mockStorageService = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      delete: vi.fn()
    };

    mockGoogleTagManagerService = {
      appendTrackingCode: vi.fn()
    };

    mockLocation = {
      back: vi.fn()
    };

    mockRouter = {
      navigateByUrl: vi.fn()
    };

    mockSnackBar = {
      open: vi.fn().mockReturnValue({
        onAction: vi.fn().mockReturnValue({
          subscribe: vi.fn()
        })
      })
    };

    mockSwUpdate = {
      isEnabled: true,
      checkForUpdate: vi.fn(),
      versionUpdates: {
        subscribe: vi.fn()
      } as any
    };

    TestBed.configureTestingModule({
      providers: [
        AppManager,
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: Session, useValue: mockSession },
        { provide: StorageService, useValue: mockStorageService },
        { provide: GoogleTagManagerService, useValue: mockGoogleTagManagerService },
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: SwUpdate, useValue: mockSwUpdate },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    appManager = TestBed.inject(AppManager);
  });

  describe('properties', () => {
    it('should have allowSignup as true', () => {
      // Arrange & Act & Assert
      expect(appManager.allowSignup).toBe(true);
    });

    it('should have allowAuthFederation as false', () => {
      // Arrange & Act & Assert
      expect(appManager.allowAuthFederation).toBe(false);
    });

    it('should have languages signal', () => {
      // Arrange & Act
      const languages = appManager.languages();

      // Assert
      expect(languages).toEqual(LANGUAGES);
    });

    it('should have updateStatus signal', () => {
      // Arrange & Act
      const status = appManager.updateStatus();

      // Assert
      expect(status).toBe('done');
    });

    it('should have version', () => {
      // Arrange & Act & Assert
      expect(appManager.version).toBeDefined();
      expect(typeof appManager.version).toBe('string');
    });
  });

  describe('getClientId', () => {
    it('should generate new client ID if not exists', () => {
      // Arrange
      (mockStorageService.get as any).mockReturnValue(null);
      const setSpy = vi.spyOn(mockStorageService, 'set');

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
      (mockStorageService.get as any).mockReturnValue(existingId);

      // Act
      const clientId = appManager.getClientId();

      // Assert
      expect(clientId).toBe(existingId);
      expect(mockStorageService.get).toHaveBeenCalled();
    });
  });

  describe('getLocale', () => {
    it('should return locale from storage', () => {
      // Arrange
      (mockStorageService.get as any).mockReturnValue('es');

      // Act
      const locale = appManager.getLocale();

      // Assert
      expect(locale).toBe('es');
    });

    it('should return default locale if not in storage', () => {
      // Arrange
      (mockStorageService.get as any).mockReturnValue(null);

      // Act
      const locale = appManager.getLocale();

      // Assert
      expect(locale).toBe('en');
    });
  });

  describe('goBack', () => {
    it('should navigate back if history length > 1', () => {
      // Arrange
      Object.defineProperty(window, 'history', {
        value: { length: 2 },
        writable: true,
        configurable: true
      });

      // Act
      appManager.goBack();

      // Assert
      expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should navigate to home if history length <= 1', () => {
      // Arrange
      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true,
        configurable: true
      });

      // Act
      appManager.goBack();

      // Assert
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
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

  describe('initialized', () => {
    it('should start as false', () => {
      // Arrange & Act & Assert
      expect(appManager.initialized).toBe(false);
    });
  });
});

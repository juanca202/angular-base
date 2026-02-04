/**
 * Mocks para servicios comunes de la aplicación
 * Reutilizables en pruebas de componentes y servicios
 */
import { vi } from 'vitest';
import { signal, computed, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { AppManager } from '@/core/services/app-manager';
import { AuthService } from '@/cross/auth/auth-service';
import { AuthProvider } from '@/core/models/auth.provider';
import { Session } from '@/core/services/session';
import { GoogleTagManagerService, StorageService } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { Settings } from '@/core/models/settings';
import { User } from '@/core/models/user';

/**
 * Crea un mock de AppManager
 */
export function createMockAppManager(overrides?: Partial<AppManager>): Partial<AppManager> {
  return {
    name: 'Test App',
    getLocale: vi.fn().mockReturnValue('en'),
    languages: signal([]),
    ...overrides
  };
}

/**
 * Crea un mock de AuthService
 */
export function createMockAuthService(overrides?: Partial<AuthService>): Partial<AuthService> {
  return {
    connect: vi.fn().mockResolvedValue(true),
    signin: vi.fn().mockResolvedValue({}),
    signup: vi.fn().mockResolvedValue({}),
    ...overrides
  };
}

/**
 * Crea un mock de AuthProvider
 */
export function createMockAuthProvider(overrides?: Partial<AuthProvider>): Partial<AuthProvider> {
  return {
    settings: signal<Settings | undefined>(undefined),
    loggedIn: new EventEmitter<boolean>(false),
    getToken: vi.fn().mockReturnValue({ token: 'mock-token' }),
    logout: vi.fn().mockReturnValue(true),
    changePassword: vi.fn(),
    confirmDeleteUser: vi.fn(),
    getSettings: vi.fn().mockResolvedValue({
      language: 'en',
      subscription: {
        code: 'premium',
        name: 'Premium',
        plan: { code: 'premium', name: 'Premium Plan' }
      },
      environment: 'production',
      onboarding: false
    } as Settings),
    ...overrides
  };
}

/**
 * Crea un mock de Session
 */
export function createMockSession(overrides?: Partial<Session>): Partial<Session> {
  return {
    isLoggedIn: computed(() => false),
    ...overrides
  };
}

/**
 * Crea un mock de GoogleTagManagerService
 */
export function createMockGoogleTagManagerService(
  overrides?: Partial<GoogleTagManagerService>
): Partial<GoogleTagManagerService> {
  return {
    appendTrackingCode: vi.fn(),
    addVariable: vi.fn(),
    ...overrides
  };
}

/**
 * Crea un mock de MessageService
 */
export function createMockMessageService(
  overrides?: Partial<MessageService>
): Partial<MessageService> {
  return {
    show: vi.fn().mockReturnValue(of(undefined)),
    ...overrides
  };
}

/**
 * Crea un mock de MatDialog
 */
export function createMockMatDialog(overrides?: Partial<MatDialog>): Partial<MatDialog> {
  return {
    open: vi.fn(),
    ...overrides
  };
}

/**
 * Crea un mock de MatDialogRef
 */
export function createMockMatDialogRef<T = any>(
  overrides?: Partial<MatDialogRef<T>>
): Partial<MatDialogRef<T>> {
  return {
    close: vi.fn(),
    ...overrides
  };
}

/**
 * Crea un mock de MatSnackBar
 */
export function createMockMatSnackBar(overrides?: Partial<MatSnackBar>): Partial<MatSnackBar> {
  return {
    open: vi.fn().mockReturnValue({
      onAction: vi.fn().mockReturnValue({
        subscribe: vi.fn()
      })
    }),
    ...overrides
  };
}

/**
 * Crea un mock de Location
 */
export function createMockLocation(overrides?: Partial<Location>): Partial<Location> {
  return {
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    replaceState: vi.fn(),
    ...overrides
  };
}

/**
 * Crea un mock de SwUpdate
 */
export function createMockSwUpdate(overrides?: Partial<SwUpdate>): Partial<SwUpdate> {
  return {
    isEnabled: true,
    checkForUpdate: vi.fn(),
    versionUpdates: {
      subscribe: vi.fn()
    } as any,
    ...overrides
  };
}

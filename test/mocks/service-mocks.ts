/**
 * Mocks para servicios comunes de la aplicación
 * Reutilizables en pruebas de componentes y servicios
 */
import { vi } from 'vitest';
import { signal, computed } from '@angular/core';
import { of } from 'rxjs';
import { AppManager } from '@/core/services/app-manager';
import { AuthProvider, AuthService } from '@factor_ec/utils';
import { Session } from '@/core/services/session';
import { GoogleTagManager } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';

/**
 * Crea un mock de AppManager
 */
export function createMockAppManager(overrides?: Partial<AppManager>): Partial<AppManager> {
  return {
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
    user: signal(null),
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn().mockResolvedValue(true),
    isLoggedIn: signal(false),
    signup: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn().mockResolvedValue(false),
    ...overrides
  };
}

/**
 * Crea un mock de AuthProvider
 */
export function createMockAuthProvider(overrides?: Partial<AuthService>): Partial<AuthService> {
  return {
    user: signal(null),
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn().mockResolvedValue(true),
    isLoggedIn: signal(false),
    signup: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn().mockResolvedValue(false),
    ...overrides
  };
}

/**
 * Crea un mock de Session
 */
export function createMockSession(overrides?: Partial<Session>): Partial<Session> {
  return {
    params: computed(() => null),
    settings: computed(() => null),
    getSettings: vi.fn().mockResolvedValue(null),
    clearSettings: vi.fn(),
    setParam: vi.fn(),
    setParams: vi.fn(),
    clearParams: vi.fn(),
    clearAll: vi.fn(),
    ...overrides
  };
}

/**
 * Crea un mock de GoogleTagManagerService
 */
export function createMockGoogleTagManagerService(
  overrides?: Partial<GoogleTagManager>
): Partial<GoogleTagManager> {
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
 * Provider de MessageService mockeado, listo para usar en `providers: [...]`.
 * Evita que los callers bajo `src/app/core` importen `@factor_ec/ui` directamente
 * (architecture/CR-002 solo exceptúa a `app-manager.ts` y `error.ts`, no a sus specs).
 */
export function createMockMessageServiceProvider(overrides?: Partial<MessageService>) {
  return { provide: MessageService, useValue: createMockMessageService(overrides) };
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

/**
 * Mocks genéricos para servicios de Angular
 * Reutilizables en todas las pruebas
 */
import { vi } from 'vitest';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, UrlTree, Navigation } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { signal } from '@angular/core';
import { UI_OPTIONS } from '@factor_ec/ui';
import { StorageService } from '@factor_ec/utils';
import { ParamMap } from '@angular/router';

/**
 * Factory function to create a mock Title service
 */
export function createMockTitle(): Title {
  return {
    setTitle: vi.fn()
  } as any;
}

/**
 * Factory function to create a mock Router
 */
export function createMockRouter(overrides?: Partial<Router>): Partial<Router> {
  return {
    navigateByUrl: vi.fn(),
    createUrlTree: vi.fn().mockReturnValue({} as UrlTree),
    parseUrl: vi.fn().mockReturnValue({} as UrlTree),
    serializeUrl: vi.fn().mockReturnValue(''),
    events: EMPTY,
    currentNavigation: signal<Navigation | null>(null),
    ...overrides
  };
}

/**
 * Factory function to create a mock ActivatedRoute
 */
export function createMockActivatedRoute(
  overrides?: Partial<ActivatedRoute>
): Partial<ActivatedRoute> {
  return {
    snapshot: {
      params: {},
      data: {}
    } as any,
    paramMap: new Subject<ParamMap>().asObservable(),
    ...overrides
  };
}

/**
 * Factory function to create a mock ActivatedRoute with paramMap Subject
 */
export function createMockActivatedRouteWithParamMap(
  paramMapSubject?: Subject<ParamMap>,
  overrides?: Partial<ActivatedRoute>
): { route: Partial<ActivatedRoute>; paramMapSubject: Subject<ParamMap> } {
  const subject = paramMapSubject || new Subject<ParamMap>();
  return {
    route: {
      snapshot: {
        params: {},
        data: {}
      } as any,
      paramMap: subject.asObservable(),
      ...overrides
    },
    paramMapSubject: subject
  };
}

/**
 * Factory function to create a mock StorageService
 */
export function createMockStorageService(
  overrides?: Partial<StorageService>
): Partial<StorageService> {
  return {
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    delete: vi.fn(),
    ...overrides
  };
}

/**
 * Factory function to create UI_OPTIONS provider value
 */
export function createMockUIOptions(overrides?: {
  iconSettings?: { path: string; collection: string };
}): { iconSettings: { path: string; collection: string } } {
  return {
    iconSettings: {
      path: 'images',
      collection: 'factoricons-regular',
      ...overrides?.iconSettings
    }
  };
}

/**
 * Common test providers that can be reused across tests
 */
export const COMMON_TEST_PROVIDERS = {
  /**
   * Get common providers for components that use Router
   */
  getRouterProviders: (
    mockRouter?: Partial<Router>,
    mockActivatedRoute?: Partial<ActivatedRoute>
  ) => [
    { provide: Router, useValue: mockRouter || createMockRouter() },
    { provide: ActivatedRoute, useValue: mockActivatedRoute || createMockActivatedRoute() }
  ],

  /**
   * Get common providers for components that use Title
   */
  getTitleProvider: (mockTitle?: Title) => [
    { provide: Title, useValue: mockTitle || createMockTitle() }
  ],

  /**
   * Get common providers for components that use UI_OPTIONS
   */
  getUIOptionsProvider: (options?: Parameters<typeof createMockUIOptions>[0]) => [
    { provide: UI_OPTIONS, useValue: createMockUIOptions(options) }
  ],

  /**
   * Get common providers for components that use StorageService
   */
  getStorageServiceProvider: (mockStorage?: Partial<StorageService>) => [
    { provide: StorageService, useValue: mockStorage || createMockStorageService() }
  ],

  /**
   * Get all common providers for typical component tests
   */
  getCommonProviders: (options?: {
    router?: Partial<Router>;
    activatedRoute?: Partial<ActivatedRoute>;
    title?: Title;
    storageService?: Partial<StorageService>;
    uiOptions?: Parameters<typeof createMockUIOptions>[0];
  }) => {
    return [
      ...COMMON_TEST_PROVIDERS.getRouterProviders(options?.router, options?.activatedRoute),
      ...COMMON_TEST_PROVIDERS.getTitleProvider(options?.title),
      ...COMMON_TEST_PROVIDERS.getStorageServiceProvider(options?.storageService),
      ...COMMON_TEST_PROVIDERS.getUIOptionsProvider(options?.uiOptions)
    ];
  }
};

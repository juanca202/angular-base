/**
 * Helpers para mockear window.location y otras APIs del navegador
 * Reutilizables en pruebas que requieren manipular window.location
 */
import { vi } from 'vitest';

/**
 * Interfaz para el mock de Location
 */
export interface MockLocation {
  reload: ReturnType<typeof vi.fn>;
  href: string;
  origin: string;
  pathname: string;
  search: string;
  hash: string;
  [key: string]: any;
}

/**
 * Crea un mock de window.location con un spy para reload
 * @returns Un objeto con el mock de location y funciones de cleanup
 */
export function createMockWindowLocation(): {
  mockLocation: MockLocation;
  reloadSpy: ReturnType<typeof vi.fn>;
  cleanup: () => void;
} {
  const reloadSpy = vi.fn();
  const originalLocation = window.location;

  const mockLocation: MockLocation = {
    ...originalLocation,
    reload: reloadSpy,
    href: originalLocation.href,
    origin: originalLocation.origin,
    pathname: originalLocation.pathname,
    search: originalLocation.search,
    hash: originalLocation.hash
  };

  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: mockLocation
  });

  const cleanup = () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation
    });
  };

  return {
    mockLocation,
    reloadSpy,
    cleanup
  };
}

/**
 * Helper para ejecutar un test con un mock de window.location
 * Automáticamente limpia el mock después del test
 */
export async function withMockLocation<T>(
  callback: (mock: {
    mockLocation: MockLocation;
    reloadSpy: ReturnType<typeof vi.fn>;
  }) => T | Promise<T>
): Promise<T> {
  const { mockLocation, reloadSpy, cleanup } = createMockWindowLocation();
  try {
    return await callback({ mockLocation, reloadSpy });
  } finally {
    cleanup();
  }
}

/**
 * Mocks para environment
 * Reutilizables en pruebas que requieren configuración de environment
 */
import { vi } from 'vitest';

/**
 * Configura un mock básico de environment
 */
export function createMockEnvironment(overrides?: Partial<any>): any {
  return {
    restEndpoint: '/api',
    sessionPrefix: 'app',
    appInsights: {
      instrumentationKey: 'test-key'
    },
    ...overrides
  };
}

/**
 * Configura el mock de environment para vitest
 * Debe ser llamado antes de importar módulos que usen environment
 */
export function setupEnvironmentMock(overrides?: Partial<any>): void {
  vi.mock('@/environments/environment', () => ({
    environment: createMockEnvironment(overrides)
  }));
}

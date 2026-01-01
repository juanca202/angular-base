/**
 * Mocks para ApplicationInsights
 * Reutilizables en pruebas que requieren ApplicationInsights
 */
import { vi } from 'vitest';

// Mock functions para ApplicationInsights
export const mockTrackPageView = vi.fn();
export const mockTrackEvent = vi.fn();
export const mockTrackMetric = vi.fn();
export const mockTrackException = vi.fn();
export const mockTrackTrace = vi.fn();
export const mockLoadAppInsights = vi.fn();

/**
 * Crea un mock de ApplicationInsights
 */
export function createMockApplicationInsights() {
  class MockApplicationInsights {
    loadAppInsights = mockLoadAppInsights;
    trackPageView = mockTrackPageView;
    trackEvent = mockTrackEvent;
    trackMetric = mockTrackMetric;
    trackException = mockTrackException;
    trackTrace = mockTrackTrace;
  }
  return {
    ApplicationInsights: MockApplicationInsights
  };
}

/**
 * Limpia todos los mocks de ApplicationInsights
 */
export function clearApplicationInsightsMocks(): void {
  vi.clearAllMocks();
}

/**
 * Configura el mock de ApplicationInsights para vitest
 * Debe ser llamado antes de importar módulos que usen ApplicationInsights
 */
export function setupApplicationInsightsMock(): void {
  vi.mock('@microsoft/applicationinsights-web', () => createMockApplicationInsights());
}


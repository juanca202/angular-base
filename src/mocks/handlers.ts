import { http, HttpResponse, type RequestHandler } from 'msw';

/**
 * Handlers MSW compartidos (ADR-007 / testing/http-api-mocks-msw).
 * Añadir aquí las rutas HTTP a interceptar en unit/integration (y, opcionalmente, en browser/dev).
 *
 * @example
 * http.get('/api/health', () => HttpResponse.json({ status: 'ok' }))
 */
export const handlers: RequestHandler[] = [
  // Placeholder vacío: añadir handlers reales por dominio/feature.
];

export { http, HttpResponse };

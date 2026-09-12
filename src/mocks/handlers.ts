import { http, HttpResponse, type RequestHandler } from 'msw';
import { getApiUrl } from '@/core/utils/async-resources';

/**
 * Handlers MSW compartidos (ADR-007 / testing/http-api-mocks-msw).
 * Añadir aquí las rutas HTTP a interceptar en unit/integration (y, opcionalmente, en browser/dev).
 * Los specs pueden sobreescribir la respuesta puntualmente con `server.use(...)`.
 *
 * @example
 * http.get('/api/health', () => HttpResponse.json({ status: 'ok' }))
 */
export const handlers: RequestHandler[] = [
  http.get(getApiUrl('settings'), () => HttpResponse.json({}))
];

export { http, HttpResponse };

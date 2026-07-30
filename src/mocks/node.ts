import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * Server MSW para pruebas unitarias/integración en Node (Vitest; ADR-007).
 * Uso típico en un setup de suite o en el spec:
 * `beforeAll(() => server.listen())`
 * `afterEach(() => server.resetHandlers())`
 * `afterAll(() => server.close())`
 */
export const server = setupServer(...handlers);

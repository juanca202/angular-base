import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/**
 * Worker MSW para navegador / desarrollo local (opcional; ADR-007).
 * Arrancar explícitamente donde se necesite, p. ej. en un bootstrap de desarrollo:
 * `await worker.start()`.
 */
export const worker = setupWorker(...handlers);

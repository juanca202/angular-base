import { of } from 'rxjs';

import { MockHttpClient } from '../../src/app/core/services/mock-http-client';

/** Usuario mock para sesión */
const MOCK_USER = {
  username: 'mock-user',
  email: 'mock@test.com',
  roles: ['user'],
  firstName: 'Mock',
  lastName: 'User',
  picture: ''
};

/** Settings mock para continuar el flujo */
const MOCK_SETTINGS = {
  language: 'en',
  subscription: {
    code: '1',
    name: 'Basic',
    plan: { code: '1', name: 'Basic' }
  },
  environment: 'development',
  onboarding: false,
  user: MOCK_USER
};

/** Token JWT mock (base64 payload: { exp: fecha futura }) */
const MOCK_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.xxx';

/**
 * Registra las rutas mock de auth y settings en MockHttpClient.
 * Llamar desde el constructor del servicio que usa MockHttpClient.
 */
export function registerMockAuthRoutes(mockClient: MockHttpClient): void {
  mockClient.registerCustomRoute('POST', 'authentication_token', () =>
    of({ token: MOCK_JWT, refresh_token: 'mock-refresh-token' })
  );
  mockClient.registerCustomRoute('POST', 'signin', () =>
    of({ token: MOCK_JWT, refresh_token: 'mock-refresh-token' })
  );
  mockClient.registerCustomRoute('POST', 'authentication_signup', () =>
    of({ success: true })
  );
  mockClient.registerCustomRoute('POST', 'signup', () =>
    of({ success: true })
  );
  mockClient.registerCustomRoute('POST', 'authentication_refresh_token', () =>
    of({ value: MOCK_JWT, token: MOCK_JWT, type: 'jwt' })
  );
  mockClient.registerCustomRoute('POST', 'refresh', () =>
    of({ value: MOCK_JWT, token: MOCK_JWT, type: 'jwt' })
  );
  mockClient.registerCustomRoute('GET', '/settings', () => of(MOCK_SETTINGS));
  mockClient.registerCustomRoute('GET', 'settings', () => of(MOCK_SETTINGS));
}

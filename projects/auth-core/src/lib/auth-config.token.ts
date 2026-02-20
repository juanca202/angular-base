import { InjectionToken } from '@angular/core';
import type { AuthConfig } from './models/auth-config';

/**
 * Injection token for auth configuration.
 * Provide this in app.config with values from environment.
 *
 * @example
 * ```typescript
 * import { AUTH_CONFIG } from 'auth-core';
 * import { environment } from '@/environments/environment';
 *
 * providers: [
 *   { provide: AUTH_CONFIG, useValue: environment }
 * ]
 * ```
 */
export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');

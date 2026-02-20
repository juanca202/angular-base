/**
 * Base interface for JWT token payloads.
 * Use JWTTokenPayload for the standard JWT claims implementation.
 */
export interface AuthTokenPayload {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

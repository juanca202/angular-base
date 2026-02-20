import { AuthTokenPayload } from './auth-token-payload';

export interface JwtAuthProvider {
  getTokenPayload<T = AuthTokenPayload>(): T | null;
}

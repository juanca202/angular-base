export interface JwtAuthProvider {
  getTokenPayload<T = any>(): T | null;
}

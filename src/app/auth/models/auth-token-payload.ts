export interface AuthTokenPayload {
  exp: number;
  iat: string;
  roles: string[];
  username: string;
}

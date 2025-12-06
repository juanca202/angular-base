import { AuthResult } from './auth-result';

export interface AuthProvider {
  signin(data: any): Promise<AuthResult>;
  logout(): Promise<void>;
  getToken(): string | null;
}

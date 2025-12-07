import { AuthResult } from './auth-result';
import { Login } from './login';

export interface AuthProvider {
  signin(data: Login): Promise<AuthResult>;
  logout(): Promise<void>;
  getToken(): string | null;
}

import { User } from '@/core/models/user';

export interface AuthResult {
  token: string;
  user?: User;
  metadata?: any;
}

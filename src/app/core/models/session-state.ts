import { Settings } from './settings';
import { User } from './user';

export interface CustomParams {
  [key: string]: any;
}

export interface SessionToken {
  value: string;
  expiresAt?: number; // Timestamp in seconds (JWT exp format)
  type?: string;
}

export interface SessionState {
  user: User | null;
  settings: Settings | null;
  params: CustomParams | null;
  token: SessionToken | null;
}

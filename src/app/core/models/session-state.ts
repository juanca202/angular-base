import { Settings } from './settings';
import { User } from './user';

export interface CustomParams {
  [key: string]: any;
}

export interface SessionState {
  user: User | null;
  settings: Settings | null;
  params: CustomParams;
}

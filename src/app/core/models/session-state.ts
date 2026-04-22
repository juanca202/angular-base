import { Settings } from './settings';

export interface CustomParams {
  [key: string]: unknown;
}

export interface SessionState {
  settings: Settings | null;
  params: CustomParams | null;
}

import { Settings } from './settings';

export interface CustomParams {
  [key: string]: any;
}

export interface SessionState {
  settings: Settings | null;
  params: CustomParams | null;
}

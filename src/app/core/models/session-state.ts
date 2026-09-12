import { Settings } from '@/core/models/settings';

export interface CustomParams {
  [key: string]: unknown;
}

export interface SessionState {
  settings: Settings | null;
  params: CustomParams | null;
}

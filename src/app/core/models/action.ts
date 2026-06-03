import { ACTION_TYPE } from '../constants/action-type';

export interface Action {
  id: string;
  label?: string;
  type: ActionType;
  visible?: boolean;
  selected?: boolean;
  children?: Action[];
  click?: () => void;
  payload?: Record<string, unknown>;
}

export type ActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

import { ActionType } from '../constants/action-type';

export interface Action {
  id: string;
  label?: string;
  type: ActionType;
  visible?: boolean;
  selected?: boolean;
  children?: Action[];
  click?: () => void;
  payload?: any;
}

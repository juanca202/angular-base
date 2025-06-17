import { Action } from './action';
import { User } from '@factor_ec/utils';

export interface Notification {
  id: string;
  body: string;
  action?: Action;
  seen: boolean;
  createdAt: Date;
  createdBy: Pick<User, 'username'>;
  updatedAt: Date;
  updatedBy: Pick<User, 'username'>;
}

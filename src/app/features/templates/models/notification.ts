import { User } from '@factor_ec/utils';
import { Action } from '@/shared/models/action';

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

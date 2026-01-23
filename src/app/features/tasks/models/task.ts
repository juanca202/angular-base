import { CollectionQueryParams } from '@/core/models/collection';
import { User } from '@/core/models/user';

export type TaskStatus = 'pending' | 'frozen' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User;
  dueDate?: string;
}

export type TaskRequestCreate = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type TaskRequestUpdate = Partial<TaskRequestCreate> & {
  id: Task['id'];
};

export interface TaskSearchParams extends CollectionQueryParams {
  status?: TaskStatus;
  sort?: string;
  order?: 'asc' | 'desc';
}

import { TaskStatus } from './task-status';

/**
 * User reference interface.
 * Matches the User DTO from docs/contracts/core/user.md
 */
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

/**
 * Task entity interface.
 *
 * @remarks
 * Represents a task assigned to a user.
 * Matches the Task DTO from docs/contracts/tasks/task.md
 */
export interface Task {
  id: string; // UUID v7
  title: string; // Required, max 50 characters
  description: string; // Optional, max 250 characters
  status: TaskStatus; // Required: 'pending' | 'frozen' | 'completed'
  dueAt: string | null; // Optional ISO 8601 date string
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  createdBy: User; // User who created the task
  updatedBy: User; // User who last updated the task
}

/**
 * Request type for creating a new task.
 * Omits fields generated automatically by the system.
 */
export type TaskRequestCreate = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Request type for updating an existing task.
 * Only allows updating specific fields.
 */
export type TaskRequestUpdate = Partial<
  Pick<Task, 'title' | 'description' | 'status' | 'dueAt'>
> & {
  id: string;
};

/**
 * Request type for updating task status.
 */
export interface TaskRequestUpdateStatus {
  id: string;
  status: TaskStatus;
}

/**
 * Request type for deleting a task.
 */
export interface TaskRequestDelete {
  id: string;
}

/**
 * Search parameters for filtering and sorting tasks.
 */
export interface TaskSearchParams {
  status?: TaskStatus;
  sort?: string; // Property name to sort by (e.g., 'dueAt', 'createdAt', 'title')
  order?: 'asc' | 'desc';
}

/**
 * Formats the due date information for display.
 *
 * @param dueAt - ISO 8601 date string or null
 * @returns Formatted string like "Vence en X días", "Vencida hace X días", "Vence mañana", "Vence hoy", or empty string
 */
export function formatTaskDueDate(dueAt: string | null): string {
  if (!dueAt) {
    return '';
  }

  const now = new Date();
  const due = new Date(dueAt);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Overdue
    const daysOverdue = Math.abs(diffDays);
    return daysOverdue === 1 ? 'Vencida hace 1 día' : `Vencida hace ${daysOverdue} días`;
  } else if (diffDays === 0) {
    // Due today
    return 'Vence hoy';
  } else if (diffDays === 1) {
    // Due tomorrow
    return 'Vence mañana';
  } else {
    // Due in future
    return `Vence en ${diffDays} días`;
  }
}

/**
 * Checks if a task is overdue.
 *
 * @param dueAt - ISO 8601 date string or null
 * @returns true if the task is overdue, false otherwise
 */
export function isTaskOverdue(dueAt: string | null): boolean {
  if (!dueAt) {
    return false;
  }

  const now = new Date();
  const due = new Date(dueAt);
  return due.getTime() < now.getTime();
}

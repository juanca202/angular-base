/**
 * Task status type definition.
 *
 * @remarks
 * Represents the possible states a task can be in:
 * - pending: Task to be completed
 * - frozen: Task in temporary pause (standby)
 * - completed: Task finished
 */
export type TaskStatus = 'pending' | 'frozen' | 'completed';

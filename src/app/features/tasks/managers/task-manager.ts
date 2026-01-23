import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '@factor_ec/ui';
import { firstValueFrom } from 'rxjs';
import { TaskForm } from '../components/task-form/task-form';
import { TaskRepository } from '../repositories/task-repository';
import { TaskRequestUpdateStatus, TaskRequestDelete } from '../models/task';

/**
 * Coordinates the experience for opening task dialogs and managing task actions.
 *
 * @remarks
 * Centralizing the dialog logic keeps components lightweight and allows us to
 * tweak presentation rules in a single place.
 * Follows the EntityManager pattern from templates feature.
 */
@Injectable({
  providedIn: 'root'
})
export class TaskManager {
  // Dependency injection
  private readonly taskRepository = inject(TaskRepository);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  // Properties
  private readonly mutations = this.taskRepository.mutations();

  /**
   * Opens the task form dialog for creating a new task.
   */
  public async open(): Promise<void> {
    const config = {
      data: {},
      panelClass: ['ft-dialog', 'ft-dialog--stacked'],
      height: '100vh',
      width: '600px',
      position: {
        left: 'auto',
        right: '0'
      },
      disableClose: true
    };

    const dialogRef = this.dialog.open(TaskForm, config);
    const sub = dialogRef.componentInstance.afterSubmit.subscribe(() => {
      sub.unsubscribe();
    });
  }

  /**
   * Completes multiple selected tasks.
   *
   * @param taskIds - Array of task IDs to complete
   */
  public async completeSelected(taskIds: string[]): Promise<void> {
    if (taskIds.length === 0) {
      return;
    }

    // Update each task to 'completed' status
    // Errors are already handled by mutations
    const updatePromises = taskIds.map((id) =>
      this.mutations.updateStatus({ id, status: 'completed' } as TaskRequestUpdateStatus)
    );
    await Promise.all(updatePromises);

    this.messageService.show(
      $localize`${taskIds.length} task${taskIds.length > 1 ? 's' : ''} completed successfully.`,
      {
        class: 'ft-message--success',
        icon: 'check--circle'
      }
    );
  }

  /**
   * Deletes multiple selected tasks with confirmation.
   *
   * @param taskIds - Array of task IDs to delete
   * @returns Promise that resolves to the user's choice (0 = cancel, 1 = accept)
   */
  public async deleteSelected(taskIds: string[]): Promise<number> {
    if (taskIds.length === 0) {
      return 0;
    }

    const taskCount = taskIds.length;
    const message =
      taskCount === 1
        ? $localize`Are you sure you want to delete this task?`
        : $localize`Are you sure you want to delete ${taskCount} tasks?`;

    const value = await firstValueFrom(
      this.messageService.show(message, {
        type: 'modal',
        class: 'text-center flex flex-col items-center gap-3',
        icon: {
          name: 'trash',
          class: 'text-danger ft-icon--4',
          collection: 'factoricons-slim'
        },
        actions: [
          {
            label: $localize`Cancel`,
            value: 0,
            type: 'stroked',
            class: 'flex-grow-1'
          },
          {
            label: $localize`Accept`,
            value: 1,
            type: 'flat',
            class: 'flex-grow-1'
          }
        ]
      })
    );

    if (value === 1) {
      // Delete each task
      // Errors are already handled by mutations
      const deletePromises = taskIds.map((id) =>
        this.mutations.delete({ id } as TaskRequestDelete)
      );
      await Promise.all(deletePromises);

      this.messageService.show(
        $localize`${taskCount} task${taskCount > 1 ? 's' : ''} deleted successfully.`,
        {
          class: 'ft-message--success',
          icon: 'check--circle'
        }
      );
    }

    return value;
  }
}

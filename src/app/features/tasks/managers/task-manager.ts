import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskForm } from '@/features/tasks/components/task-form/task-form';
import { TaskRepository } from '@/features/tasks/repositories/task-repository';
import { MessageService } from '@factor_ec/ui';
import { firstValueFrom } from 'rxjs';

/**
 * Coordinates task operations including creation, completion, and deletion.
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
    this.dialog.open(TaskForm, config);
  }

  public async completeTasks(taskIds: string[]): Promise<void> {
    if (taskIds.length === 0) return;

    const promises = taskIds.map((id) =>
      this.mutations.update({
        id,
        status: 'completed'
      })
    );

    await Promise.all(promises);
    this.messageService.show(
      $localize`${taskIds.length} task${taskIds.length > 1 ? 's' : ''} completed successfully.`,
      {
        class: 'ft-message--success',
        icon: 'check--circle'
      }
    );
  }

  public async deleteTasks(taskIds: string[]): Promise<void> {
    if (taskIds.length === 0) return;

    const value = await firstValueFrom(
      this.messageService.show(
        $localize`Are you sure you want to delete ${taskIds.length} task${taskIds.length > 1 ? 's' : ''}?`,
        {
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
              label: $localize`Delete`,
              value: 1,
              type: 'flat',
              class: 'flex-grow-1'
            }
          ]
        }
      )
    );

    if (value === 1) {
      const promises = taskIds.map((id) => this.mutations.delete(id));

      await Promise.all(promises);
      this.messageService.show(
        $localize`${taskIds.length} task${taskIds.length > 1 ? 's' : ''} deleted successfully.`,
        {
          class: 'ft-message--success',
          icon: 'check--circle'
        }
      );
    }
  }
}

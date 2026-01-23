import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';
import { TaskRepository } from '../../repositories/task-repository';
import { TaskManager } from '../../managers/task-manager';
import { TaskStatus } from '../../models/task-status';
import { TaskItem } from '../task-item/task-item';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';

/**
 * Component that displays the list of tasks organized by status (Pending, Frozen, Completed).
 *
 * @remarks
 * The component loads data through TaskRepository and displays tasks in tabs.
 * Follows the entity-list pattern for state handling (loading, error, empty).
 */
@Component({
  selector: 'app-task-list',
  imports: [MatButtonModule, IconComponent, ProgressComponent, TaskItem],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskList implements OnInit, OnDestroy {
  // Dependency injection
  private readonly taskRepository = inject(TaskRepository);
  public readonly taskManager = inject(TaskManager);

  // Properties
  public readonly currentStatus = signal<TaskStatus>('pending');
  public readonly tasks = this.taskRepository.findBy();
  public readonly selectedTasks = signal<Set<string>>(new Set());
  public readonly isSelectionMode = computed(() => this.selectedTasks().size > 0);

  constructor() {
    effect(() => {
      const change = this.taskRepository.change();
      if (!change) return;
      this.tasks.reload();
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.tasks.destroy();
  }

  /**
   * Loads tasks filtered by current status.
   */
  public loadTasks(): void {
    this.tasks.load({ status: this.currentStatus() }, { notifyError: false });
  }

  /**
   * Handles tab change.
   */
  public onTabChange(status: TaskStatus): void {
    this.currentStatus.set(status);
    this.loadTasks();
    // Clear selection when switching tabs if selected tasks are not visible in new tab
    const currentTasks = this.tasks.value() || [];
    const currentTaskIds = new Set(currentTasks.map((t) => t.id));
    const selected = this.selectedTasks();
    const visibleSelected = Array.from(selected).filter((id) => currentTaskIds.has(id));
    if (visibleSelected.length !== selected.size) {
      this.selectedTasks.set(new Set(visibleSelected));
    }
  }

  /**
   * Toggles task selection.
   */
  public toggleSelection(taskId: string, isSelected: boolean): void {
    const current = this.selectedTasks();
    const updated = new Set(current);
    if (isSelected) {
      updated.add(taskId);
    } else {
      updated.delete(taskId);
    }
    this.selectedTasks.set(updated);
  }

  /**
   * Gets the label for a status tab.
   */
  public getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      pending: $localize`Pendientes`,
      frozen: $localize`Congeladas`,
      completed: $localize`Completadas`
    };
    return labels[status];
  }

  /**
   * Handles completing selected tasks.
   */
  public async completeSelected(): Promise<void> {
    const selected = Array.from(this.selectedTasks());
    if (selected.length === 0) {
      return;
    }

    await this.taskManager.completeSelected(selected);
    // Clear selection after completion
    this.selectedTasks.set(new Set());
    // Reload tasks to reflect status changes
    this.loadTasks();
  }

  /**
   * Handles deleting selected tasks.
   */
  public async deleteSelected(): Promise<void> {
    const selected = Array.from(this.selectedTasks());
    if (selected.length === 0) {
      return;
    }

    const result = await this.taskManager.deleteSelected(selected);
    if (result === 1) {
      // User confirmed deletion
      // Clear selection after deletion
      this.selectedTasks.set(new Set());
      // Reload tasks to reflect deletions
      this.loadTasks();
    }
    // If result === 0, user cancelled, so selection remains
  }
}

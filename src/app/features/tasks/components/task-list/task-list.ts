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
import { LayoutManager } from '@/core/services/layout-manager';
import { TaskRepository } from '@/features/tasks/repositories/task-repository';
import { Task, TaskStatus } from '@/features/tasks/models/task';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';
import { MatMenuModule } from '@angular/material/menu';
import { TaskManager } from '@/features/tasks/managers/task-manager';
import { CommonModule } from '@angular/common';
import moment from 'moment';

/**
 * Displays the task list organized by status (pending, frozen, completed)
 * with support for multiple selection and bulk actions.
 */
@Component({
  selector: 'app-task-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    IconComponent,
    ProgressComponent
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskList implements OnInit, OnDestroy {
  // Dependency injection
  public readonly taskManager = inject(TaskManager);
  private readonly taskRepository = inject(TaskRepository);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly tasks = this.taskRepository.findBy();
  public readonly selectedTasks = signal<Set<string>>(new Set());
  public readonly isSelectionMode = computed(() => this.selectedTasks().size > 0);

  // Computed properties for grouped tasks
  public readonly pendingTasks = computed(() =>
    this.filterTasksByStatus(this.tasks.value() || [], 'pending')
  );
  public readonly frozenTasks = computed(() =>
    this.filterTasksByStatus(this.tasks.value() || [], 'frozen')
  );
  public readonly completedTasks = computed(() =>
    this.filterTasksByStatus(this.tasks.value() || [], 'completed')
  );

  constructor() {
    effect(() => {
      const change = this.taskRepository.change();
      if (!change) return;
      this.tasks.reload();
      // Clear selection after mutations
      if (change.type === 'delete' || change.type === 'update') {
        this.selectedTasks.set(new Set());
      }
    });
  }

  ngOnInit(): void {
    this.tasks.load(undefined, { notifyError: false });
  }

  ngOnDestroy(): void {
    this.tasks.destroy();
  }

  public toggleTaskSelection(taskId: string): void {
    const current = this.selectedTasks();
    const newSelection = new Set(current);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    this.selectedTasks.set(newSelection);
  }

  public toggleAllTasksSelection(tasks: Task[]): void {
    const current = this.selectedTasks();
    const allSelected = tasks.every((task) => current.has(task.id));
    const newSelection = new Set(current);

    if (allSelected) {
      tasks.forEach((task) => newSelection.delete(task.id));
    } else {
      tasks.forEach((task) => newSelection.add(task.id));
    }

    this.selectedTasks.set(newSelection);
  }

  public isTaskSelected(taskId: string): boolean {
    return this.selectedTasks().has(taskId);
  }

  public areAllTasksSelected(tasks: Task[]): boolean {
    return tasks.length > 0 && tasks.every((task) => this.selectedTasks().has(task.id));
  }

  public hasSomeTasksSelected(tasks: Task[]): boolean {
    return tasks.some((task) => this.selectedTasks().has(task.id));
  }

  public isIndeterminate(tasks: Task[]): boolean {
    return this.hasSomeTasksSelected(tasks) && !this.areAllTasksSelected(tasks);
  }

  public clearSelection(): void {
    this.selectedTasks.set(new Set());
  }

  public async completeSelectedTasks(): Promise<void> {
    const selectedIds = Array.from(this.selectedTasks());
    await this.taskManager.completeTasks(selectedIds);
    this.selectedTasks.set(new Set());
  }

  public async deleteSelectedTasks(): Promise<void> {
    const selectedIds = Array.from(this.selectedTasks());
    await this.taskManager.deleteTasks(selectedIds);
    this.selectedTasks.set(new Set());
  }

  public getTimeRemaining(task: Task): string {
    if (!task.dueDate) return '';
    const dueDate = moment(task.dueDate);
    const now = moment();

    if (dueDate.isBefore(now)) {
      return $localize`Overdue`;
    }

    const duration = moment.duration(dueDate.diff(now));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    if (days > 0) {
      return $localize`${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return $localize`${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return $localize`${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    }
  }

  public isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    return moment(task.dueDate).isBefore(moment());
  }

  private filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
    return tasks.filter((task) => task.status === status);
  }
}

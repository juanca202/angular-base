import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Task } from '../../models/task';
import { formatTaskDueDate, isTaskOverdue } from '../../models/task';

/**
 * Component that displays a single task item in the list.
 *
 * @remarks
 * Displays task title and temporal information (due date).
 * Highlights overdue tasks visually (red text).
 */
@Component({
  selector: 'app-task-item',
  imports: [],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItem {
  // Inputs
  public readonly task = input.required<Task>();
  public readonly isSelected = input<boolean>(false);

  // Outputs
  public readonly selectionChange = output<boolean>();

  /**
   * Formats the due date information for display.
   */
  public formatDueDate(dueAt: string | null): string {
    return formatTaskDueDate(dueAt);
  }

  /**
   * Checks if the task is overdue.
   */
  public isOverdue(dueAt: string | null): boolean {
    return isTaskOverdue(dueAt);
  }

  /**
   * Handles checkbox change event.
   */
  public onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectionChange.emit(target.checked);
  }
}

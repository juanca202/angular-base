import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  output
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { IconComponent, MessageService } from '@factor_ec/ui';

import { LayoutManager } from '@/core/services/layout-manager';
import { TaskRepository } from '../../repositories/task-repository';
import { ErrorMessagePipe } from '@/core/pipes/error-message-pipe';
import { TaskRequestCreate } from '../../models/task';
import { Operation } from '@/core/models/operation';

/**
 * Component for creating a new task.
 *
 * @remarks
 * Displays a form dialog for creating tasks with title (required),
 * description (optional), and due date (optional).
 * Follows ADR-013 form layout structure.
 */
@Component({
  selector: 'app-task-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ErrorMessagePipe
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskForm implements OnInit, OnDestroy {
  // Dependency injection
  private readonly taskRepository = inject(TaskRepository);
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);
  private readonly dialogRef = inject(MatDialogRef<TaskForm>);
  private readonly messageService = inject(MessageService);

  // Properties
  public readonly taskMutations = this.taskRepository.mutations();
  public readonly form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(250)]],
    dueAt: [null]
  });

  // Events
  public readonly afterSubmit = output<Operation | null>();

  ngOnInit(): void {
    // Form is for creating new tasks only in this phase
  }

  ngOnDestroy(): void {
    // No cleanup needed for create-only form
  }

  public async submit(): Promise<void> {
    if (this.form.valid) {
      const formData = this.form.value;
      try {
        this.form.disable();
        // Create new task with status 'pending' by default
        const taskRequest: TaskRequestCreate = {
          title: formData.title,
          description: formData.description || '',
          status: 'pending',
          dueAt: formData.dueAt ? formData.dueAt.toISOString() : null
        };
        await this.taskMutations.create(taskRequest);
        // Close dialog on success
        this.dialogRef.close();
        // Show confirmation message
        this.messageService.show($localize`Task created successfully.`, {
          class: 'ft-message--success',
          icon: 'check--circle'
        });
        this.afterSubmit.emit({ type: 'create', entity: null });
      } finally {
        this.form.enable();
      }
    }
  }
}

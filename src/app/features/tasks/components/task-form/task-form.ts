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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { IconComponent, MessageService, ProgressComponent } from '@factor_ec/ui';

import { LayoutManager } from '@/core/services/layout-manager';
import { TaskRepository } from '@/features/tasks/repositories/task-repository';
import { ErrorMessagePipe } from '@/core/pipes/error-message-pipe';
import { Task, TaskStatus } from '@/features/tasks/models/task';
import { OPERATION_TYPE } from '@/core/constants/operation-type';
import { Operation, OperationType } from '@/core/models/operation';
import moment from 'moment';

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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ProgressComponent,
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
  public readonly task = this.taskRepository.find();
  public readonly taskMutations = this.taskRepository.mutations();
  public readonly form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(250)]],
    status: ['pending' as TaskStatus, [Validators.required]],
    dueDate: [null]
  });

  // Events
  public readonly afterSubmit = output<Operation | null>();

  ngOnInit(): void {
    if (this.data?.id) {
      this.task.load(this.data.id).then((task) => {
        if (task) {
          this.form.patchValue({
            ...task,
            dueDate: task.dueDate ? moment(task.dueDate).toDate() : null
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.task.destroy();
  }

  public async submit(): Promise<void> {
    if (this.form.valid) {
      const formData = this.form.value;
      try {
        let task: Task | null;
        let type: OperationType;
        this.form.disable();

        const taskData = {
          ...formData,
          dueDate: formData.dueDate ? moment(formData.dueDate).toISOString() : undefined
        };

        if (this.data?.id) {
          // Update existing task
          task = await this.taskMutations.update({ ...taskData, id: this.data.id });
          type = OPERATION_TYPE.UPDATE;
        } else {
          // Create new task
          task = await this.taskMutations.create(taskData);
          type = OPERATION_TYPE.CREATE;
        }

        // Close dialog on success
        this.dialogRef.close();
        // Show confirmation message
        this.messageService.show($localize`Task saved successfully.`, {
          class: 'ft-message--success',
          icon: 'check--circle'
        });
        this.afterSubmit.emit({ type, entity: task });
      } finally {
        this.form.enable();
      }
    }
  }
}

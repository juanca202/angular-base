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

import { IconComponent, MessageService, ProgressComponent } from '@factor_ec/ui';

import { LayoutManager } from '@/core/services/layout-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { ErrorMessagePipe } from '@/core/pipes/error-message-pipe';
import { Entity } from '../../models/entity';
import { OPERATION_TYPE, OperationType } from '@/core/constants/operation-type';
import { Operation } from '@/core/models/operation';
import { EntityManager } from '../../managers/entity-manager';
import { MatMenuModule } from '@angular/material/menu';
import { ENTITY_CONTEXT } from '@/shared/constants/entity-context';

@Component({
  selector: 'app-entity-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    ProgressComponent,
    ErrorMessagePipe
  ],
  templateUrl: './entity-form.html',
  styleUrl: './entity-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityForm implements OnInit, OnDestroy {
  // Dependency injection
  public readonly entityManager = inject(EntityManager);
  private readonly entityRepository = inject(EntityRepository);
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);
  private readonly dialogRef = inject(MatDialogRef<EntityForm>);
  private readonly messageService = inject(MessageService);

  // Constansts
  public readonly ENTITY_CONTEXT = ENTITY_CONTEXT;

  // Properties
  public readonly entity = this.entityRepository.find();
  public readonly entityMutations = this.entityRepository.mutations;
  public readonly form: FormGroup = this.formBuilder.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    company: [''],
    position: [''],
    notes: ['']
  });

  // Events
  public readonly afterSubmit = output<Operation | null>();

  ngOnInit(): void {
    if (this.data?.id) {
      this.entity.load(this.data.id).then((entity) => {
        if (entity) {
          this.form.patchValue(entity);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.entity.destroy();
  }

  public async submit(): Promise<void> {
    if (this.form.valid) {
      const formData = this.form.value;
      try {
        let entity: Entity | null;
        let type: OperationType;
        if (this.data?.id) {
          // Update existing entity
          entity = await this.entityMutations.update({ ...formData, id: this.data.id });
          type = OPERATION_TYPE.CREATE;
        } else {
          // Create new entity
          entity = await this.entityMutations.create(formData);
          type = OPERATION_TYPE.UPDATE;
        }
        // Close dialog on success
        this.dialogRef.close();
        // Show confirmation message
        this.messageService.show($localize`Saved successfully.`);
        this.afterSubmit.emit({ type, entity });
      } catch {
        // Error is already handled by the repository
      }
    }
  }
}

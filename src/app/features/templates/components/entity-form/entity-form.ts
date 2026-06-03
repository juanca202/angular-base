import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  output,
  signal
} from '@angular/core';
import { disabled, email, form, FormField, required, submit } from '@angular/forms/signals';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Icon } from '@factor_ec/ui';

import { LayoutManager } from '@/core/services/layout-manager';
import { notify } from '@/core/utils/notification';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { Operation, OperationType } from '@/core/models/operation';
import { Entity, EntityInput } from '../../models/entity';
import { EntityMapper } from '../../utils/entity-mapper';
import { OPERATION_TYPE } from '@/core/constants/operation-type';
import { EntityManager } from '../../managers/entity-manager';
import { MatMenuModule } from '@angular/material/menu';
import { ENTITY_CONTEXT } from '@/shared/constants/entity-context';
import { ProgressPlaceholder } from '@/shared/components/progress-placeholder/progress-placeholder';
import { ErrorPlaceholder } from '@/shared/components/error-placeholder/error-placeholder';
import { Header } from '@/shared/components/header/header';
import { IconButtonContext } from '@/shared/components/icon-button-context/icon-button-context';

@Component({
  selector: 'app-entity-form',
  imports: [
    CommonModule,
    FormField,
    Icon,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    ProgressPlaceholder,
    ErrorPlaceholder,
    Header,
    IconButtonContext
  ],
  templateUrl: './entity-form.html',
  styleUrl: './entity-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityForm implements OnInit, OnDestroy {
  // Dependency injection
  public readonly entityManager = inject(EntityManager);
  private readonly entityRepository = inject(EntityRepository);
  public readonly data = inject<{ id: string }>(MAT_DIALOG_DATA);
  public readonly layoutManager = inject(LayoutManager);
  private readonly dialogRef = inject(MatDialogRef<EntityForm>);

  // Constants
  public readonly ENTITY_CONTEXT = ENTITY_CONTEXT;

  // Properties
  public readonly entity = this.entityRepository.find();
  public readonly entityMutations = this.entityRepository.mutations();
  public readonly entityModel = signal<EntityInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    notes: ''
  });
  public readonly entityForm = form(this.entityModel, (schemaPath) => {
    required(schemaPath.firstName, { message: $localize`Field required` });
    required(schemaPath.lastName, { message: $localize`Field required` });
    required(schemaPath.email, { message: $localize`Field required` });
    email(schemaPath.email, { message: $localize`Type a valid email` });
    required(schemaPath.phone, { message: $localize`Field required` });
    disabled(schemaPath, () => this.entityMutations.submitting());
  });

  // Events
  public readonly afterSubmit = output<Operation<Entity> | null>();

  ngOnInit(): void {
    if (this.data?.id) {
      this.entity.load(this.data.id).then((entity) => {
        if (entity) {
          this.entityModel.set({
            firstName: entity.firstName,
            lastName: entity.lastName,
            email: entity.email,
            phone: entity.phone,
            company: entity.company ?? '',
            position: entity.position ?? '',
            notes: entity.notes ?? ''
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.entity.destroy();
  }

  public async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    submit(this.entityForm, async () => {
      const formData = this.entityModel();
      try {
        let entity: Entity | null;
        let type: OperationType;
        if (this.data?.id) {
          entity = await this.entityMutations.update(
            EntityMapper.mapInputToRequestUpdate(formData, this.data.id)
          );
          type = OPERATION_TYPE.UPDATE;
        } else {
          entity = await this.entityMutations.create(
            EntityMapper.mapInputToRequestCreate(formData)
          );
          type = OPERATION_TYPE.CREATE;
        }
        if (!entity) {
          return;
        }
        this.dialogRef.close();
        notify($localize`Saved successfully.`, { level: 'success' });
        this.afterSubmit.emit({ type, entity });
      } finally {
        // Form re-enables when submitting signal becomes false
      }
    });
  }
}

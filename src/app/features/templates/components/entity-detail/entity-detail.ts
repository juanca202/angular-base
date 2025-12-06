import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';
import { LayoutManager } from '@/core/services/layout-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';

/**
 * Presents the entity detail drawer, enabling both edition and creation flows
 * backed by {@link EntityRepository}.
 *
 * @remarks
 * The component keeps track of the active resource signal and submits mutations
 * depending on whether an identifier is provided through dialog data.
 */
@Component({
  selector: 'ft-entity-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    MatFormFieldModule,
    ProgressComponent
  ],
  templateUrl: './entity-detail.html',
  styleUrl: './entity-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDetail implements OnInit, OnDestroy {
  // Dependency injection
  private readonly entityRepository = inject(EntityRepository);
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly entity = this.entityRepository.find();
  public readonly entityMutations = this.entityRepository.mutations();
  public readonly form: FormGroup = this.formBuilder.group({});

  ngOnInit(): void {
    if (this.data.id) {
      this.entity.load(this.data.id);
    }
  }
  ngOnDestroy(): void {
    this.entity.destroy();
  }
  public onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      if (this.data.id) {
        // Update existing entity
        this.entityMutations.update(formData);
      } else {
        // Create new entity
        this.entityMutations.create(formData);
      }
    }
  }
}

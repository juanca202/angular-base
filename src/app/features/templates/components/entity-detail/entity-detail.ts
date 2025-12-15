import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';
import { LayoutManager } from '@/core/services/layout-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { MatButtonModule } from '@angular/material/button';
import { EntityManager } from '../../managers/entity-manager';

/**
 * Presents the entity detail drawer in read-only mode, displaying the full
 * information of the selected resource.
 *
 * @remarks
 * This component renders the entity’s data for visualization only and does not
 * perform mutations. It relies on the provided identifier in the dialog data to
 * load the active resource from the {@link EntityRepository}.
 */
@Component({
  selector: 'app-entity-detail',
  imports: [
    ReactiveFormsModule,
    IconComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    ProgressComponent
  ],
  templateUrl: './entity-detail.html',
  styleUrl: './entity-detail.scss',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDetail implements OnInit, OnDestroy {
  // Dependency injection
  private readonly entityRepository = inject(EntityRepository);
  public readonly entityManager = inject(EntityManager);
  public readonly data = inject(MAT_DIALOG_DATA);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly entity = this.entityRepository.find();
  public readonly entityMutations = this.entityRepository.mutations();

  ngOnInit(): void {
    if (this.data.id) {
      this.entity.load(this.data.id);
    }
  }
  ngOnDestroy(): void {
    this.entity.destroy();
  }
}

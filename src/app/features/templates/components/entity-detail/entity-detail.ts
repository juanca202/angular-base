import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';
import { LayoutManager } from '@/core/services/layout-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { MatButtonModule } from '@angular/material/button';
import { EntityManager } from '../../managers/entity-manager';
import { ENTITY_CONTEXT } from '../../constants/entity-context';
import { MatMenuModule } from '@angular/material/menu';

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
    MatMenuModule,
    ProgressComponent
  ],
  templateUrl: './entity-detail.html',
  styleUrl: './entity-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDetail implements OnInit, OnDestroy {
  // Dependency injection
  public readonly entityManager = inject(EntityManager);
  private readonly entityRepository = inject(EntityRepository);
  public readonly data = inject(MAT_DIALOG_DATA);
  public readonly layoutManager = inject(LayoutManager);

  // Constansts
  public readonly ENTITY_CONTEXT = ENTITY_CONTEXT;

  // Properties
  public readonly entity = this.entityRepository.find;
  public readonly entityMutations = this.entityRepository.mutations;
  public readonly related = this.entityRepository.findBy;

  constructor() {
    effect(() => {
      const change = this.entityRepository.change();
      if (!change) return;
      this.entity.refresh();
    });
  }

  ngOnInit(): void {
    if (this.data.id) {
      this.entity.load(this.data.id);
      this.related.load();
    }
  }
  ngOnDestroy(): void {
    this.entity.destroy();
  }
  public addRelation(): void {
    this.entityManager.search();
  }
}

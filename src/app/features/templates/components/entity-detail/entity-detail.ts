import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Icon } from '@factor_ec/ui';
import { LayoutManager } from '@/core/services/layout-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { MatButtonModule } from '@angular/material/button';
import { EntityManager } from '../../managers/entity-manager';
import { MatMenuModule } from '@angular/material/menu';
import { ENTITY_CONTEXT } from '@/shared/constants/entity-context';
import { ProgressPlaceholder } from '@/shared/components/progress-placeholder/progress-placeholder';
import { Header } from '@/shared/components/header/header';
import { ErrorPlaceholder } from '@/shared/components/error-placeholder/error-placeholder';
import { IconButtonContext } from '@/shared/components/icon-button-context/icon-button-context';

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
    Icon,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatMenuModule,
    ProgressPlaceholder,
    Header,
    ErrorPlaceholder,
    IconButtonContext
  ],
  templateUrl: './entity-detail.html',
  styleUrl: './entity-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDetail implements OnInit, OnDestroy {
  // Dependency injection
  public readonly entityManager = inject(EntityManager);
  private readonly entityRepository = inject(EntityRepository);
  public readonly data = inject<{ id: string }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef);
  public readonly layoutManager = inject(LayoutManager);

  // Constansts
  public readonly ENTITY_CONTEXT = ENTITY_CONTEXT;

  // Properties
  public readonly entity = this.entityRepository.find();
  public readonly entityMutations = this.entityRepository.mutations();
  public readonly related = this.entityRepository.findBy();

  constructor() {
    effect(() => {
      const change = this.entityRepository.change();
      if (!change) return;
      this.entity.reload();
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.data.id) {
      try {
        await this.entity.load(this.data.id);
        await this.related.load();
      } catch {
        this.dialogRef.close();
      }
    }
  }
  ngOnDestroy(): void {
    this.entity.destroy();
  }
  public addRelation(): void {
    this.entityManager.search();
  }
}

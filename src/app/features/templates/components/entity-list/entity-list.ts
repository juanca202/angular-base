import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  effect
} from '@angular/core';
import { LayoutManager } from '@/core/services/layout-manager';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '@factor_ec/ui';
import { MatMenuModule } from '@angular/material/menu';
import { ENTITY_CONTEXT } from '@/shared/constants/entity-context';
import { ProgressPlaceholder } from '@/shared/components/progress-placeholder/progress-placeholder';
import { ErrorPlaceholder } from '@/shared/components/error-placeholder/error-placeholder';
import { Header } from '@/shared/components/header/header';
import { IconButtonContext } from '@/shared/components/icon-button-context/icon-button-context';

/**
 * Displays the sample entity catalog using the reusable table layout.
 *
 * @remarks
 * The component loads data through {@link EntityRepository} and delegates detail
 * presentation to {@link EntityManager}, keeping the template free of business logic.
 */
@Component({
  selector: 'app-entity-list',
  imports: [
    MatButtonModule,
    MatMenuModule,
    IconComponent,
    ProgressPlaceholder,
    ErrorPlaceholder,
    Header,
    IconButtonContext
  ],
  templateUrl: './entity-list.html',
  styleUrl: './entity-list.css',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityList implements OnInit, OnDestroy {
  // Dependency injection
  public readonly entityManager = inject(EntityManager);
  private readonly entityRepository = inject(EntityRepository);
  public readonly layoutManager = inject(LayoutManager);

  // Constansts
  public readonly ENTITY_CONTEXT = ENTITY_CONTEXT;

  // Properties
  public readonly entities = this.entityRepository.findBy();

  constructor() {
    effect(() => {
      const change = this.entityRepository.change();
      if (!change) return;
      this.entities.reload();
    });
  }

  ngOnInit(): void {
    this.entities.load(undefined, { notifyError: false });
  }
  ngOnDestroy(): void {
    this.entities.destroy();
  }
}

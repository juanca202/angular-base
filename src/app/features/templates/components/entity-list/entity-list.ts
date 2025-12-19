import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { LayoutManager } from '@/core/services/layout-manager';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';
import { MatMenuModule } from '@angular/material/menu';

/**
 * Displays the sample entity catalog using the reusable table layout.
 *
 * @remarks
 * The component loads data through {@link EntityRepository} and delegates detail
 * presentation to {@link EntityManager}, keeping the template free of business logic.
 */
@Component({
  selector: 'app-entity-list',
  imports: [MatButtonModule, MatMenuModule, IconComponent, ProgressComponent],
  templateUrl: './entity-list.html',
  styleUrl: './entity-list.scss',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityList implements OnInit, OnDestroy {
  // Dependency injection
  private readonly entityRepository = inject(EntityRepository);
  public readonly entityManager = inject(EntityManager);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly entities = this.entityRepository.findBy();

  ngOnInit(): void {
    this.entities.load();
  }
  ngOnDestroy(): void {
    this.entities.destroy();
  }
}

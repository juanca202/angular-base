import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LayoutManager } from '@/core/services/layout-manager';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';

/**
 * Displays the sample entity catalog using the reusable table layout.
 *
 * @remarks
 * The component loads data through {@link EntityRepository} and delegates detail
 * presentation to {@link EntityManager}, keeping the template free of business logic.
 */
@Component({
  selector: 'ft-entity-list',
  imports: [],
  templateUrl: './entity-list.html',
  styleUrl: './entity-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityList {
  // Dependency injection
  private readonly entityRepository = inject(EntityRepository);
  public readonly entityManager = inject(EntityManager);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly entities = this.entityRepository.findBy();

  ngOnInit(): void {
    this.entities.load();
  }
}

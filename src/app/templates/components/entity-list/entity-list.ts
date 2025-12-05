import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LayoutManager } from 'app/core/services/layout-manager';
import { EntityManager } from 'app/templates/managers/entity-manager';
import { EntityRepository } from 'app/templates/repositories/entity-repository';

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

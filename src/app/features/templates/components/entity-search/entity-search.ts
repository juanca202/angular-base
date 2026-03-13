import { ChangeDetectionStrategy, Component, inject, OnInit, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';

import { Avatar, Icon } from '@factor_ec/ui';

import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { Entity } from '@/features/templates/models/entity';
import { LayoutManager } from '@/core/services/layout-manager';
import { MatButtonModule } from '@angular/material/button';
import { ErrorPlaceholder } from '@/shared/components/error-placeholder/error-placeholder';

@Component({
  selector: 'app-entity-search',
  imports: [Avatar, FormField, Icon, MatButtonModule, MatDialogContent, ErrorPlaceholder],
  templateUrl: './entity-search.html',
  styleUrl: './entity-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntitySearch implements OnInit {
  // Dependency injection
  private readonly dialogRef = inject(MatDialogRef<EntitySearch>);
  private readonly entityRepository = inject(EntityRepository);
  public readonly entityManager = inject(EntityManager);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly entities = this.entityRepository.findBy();
  public readonly searchModel = signal<{ query: string }>({ query: '' });
  public readonly searchForm = form(this.searchModel);

  // Events
  public readonly selected = output<Entity>();

  ngOnInit(): void {
    this.entities.load();
  }
  public select(entity: Entity): void {
    this.dialogRef.close();
    this.selected.emit(entity);
  }
}

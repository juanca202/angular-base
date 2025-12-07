import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';

import { AvatarComponent, IconComponent } from '@factor_ec/ui';

import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { Entity } from '@/features/templates/models/entity';
import { LayoutManager } from '@/core/services/layout-manager';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-entity-search',
  imports: [AvatarComponent, IconComponent, MatButtonModule, MatDialogContent, ReactiveFormsModule],
  templateUrl: './entity-search.html',
  styleUrl: './entity-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntitySearch implements OnInit {
  // Dependency injection
  private readonly dialogRef = inject(MatDialogRef<EntitySearch>);
  private readonly entityRepository = inject(EntityRepository);
  public readonly entityManager = inject(EntityManager);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly entities = this.entityRepository.findBy();
  public form = this.formBuilder.group({
    query: ['']
  });

  ngOnInit(): void {
    this.entities.load();
  }
  public showEntity(entity: Entity): void {
    this.dialogRef.close();
    this.entityManager.open(entity.id);
  }
}

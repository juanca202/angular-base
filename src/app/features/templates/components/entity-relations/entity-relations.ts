import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Header } from '@/shared/components/header/header';
import { IconComponent } from '@factor_ec/ui';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EntityRepository } from '../../repositories/entity-repository';
import { MatButtonModule } from '@angular/material/button';
import { ProgressPlaceholder } from '@/shared/components/progress-placeholder/progress-placeholder';
import { ErrorPlaceholder } from '@/shared/components/error-placeholder/error-placeholder';
import { EntityManager } from '../../managers/entity-manager';

@Component({
  selector: 'app-entity-relations',
  imports: [
    Header,
    IconComponent,
    MatDialogModule,
    MatButtonModule,
    ProgressPlaceholder,
    ErrorPlaceholder
  ],
  templateUrl: './entity-relations.html',
  styleUrl: './entity-relations.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityRelations implements OnInit {
  // Dependency injection
  private readonly entityManager = inject(EntityManager);
  private readonly entityRepository = inject(EntityRepository);
  public readonly data = inject<{ id: string }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef);

  // Properties
  public readonly related = this.entityRepository.findBy();

  async ngOnInit(): Promise<void> {
    if (this.data.id) {
      try {
        await this.related.load();
      } catch {
        this.dialogRef.close();
      }
    }
  }
  public addRelation(): void {
    this.entityManager.search();
  }
}

import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EntityDetail } from '@/features/templates/components/entity-detail/entity-detail';
import { EntitySearch } from '@/features/templates/components/entity-search/entity-search';
import { EntityForm } from '../components/entity-form/entity-form';
import { Operation } from '@/core/models/operation';
import { Entity, EntityContext } from '../models/entity';
import { MessageService } from '@factor_ec/ui';
import { firstValueFrom } from 'rxjs';
import { EntityRepository } from '../repositories/entity-repository';
import { Action } from '@/shared/models/action';
import { ACTION_TYPE } from '@/shared/constants/action-type';
import { ENTITY_CONTEXT } from '@/shared/constants/entity-context';

/**
 * Coordinates the experience for opening entity detail dialogs.
 *
 * @remarks
 * Centralizing the dialog logic keeps components lightweight and allows us to
 * tweak presentation rules in a single place.
 */
@Injectable({
  providedIn: 'root'
})
export class EntityManager {
  // Dependency injection
  private readonly entityRepository = inject(EntityRepository);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  // Properties
  private readonly mutations = this.entityRepository.mutations();

  public async delete(id?: string): Promise<void> {
    const value = await firstValueFrom(
      this.messageService.show($localize`Are you sure you want to delete this entity?`, {
        type: 'modal',
        class: 'text-center flex flex-col items-center gap-3',
        icon: {
          name: 'trash',
          class: 'text-danger ft-icon--4',
          collection: 'factoricons-slim'
        },
        actions: [
          {
            label: $localize`Cancel`,
            value: 0,
            type: 'stroked',
            class: 'flex-grow-1'
          },
          {
            label: $localize`Accept`,
            value: 1,
            type: 'flat',
            class: 'flex-grow-1'
          }
        ]
      })
    );
    if (value === 1 && id) {
      await this.mutations.delete(id);
      this.messageService.show($localize`Entity deleted successfully.`, {
        class: 'ft-message--success',
        icon: 'check--circle'
      });
    }
    return value;
  }
  public getContextMenu(entity: Entity | null, context?: EntityContext): Action[] {
    let actions: Action[];
    if (!entity?.id) {
      actions = [];
    } else {
      actions = [
        {
          id: 'generalGroup',
          type: ACTION_TYPE.GROUP,
          children: [
            {
              id: 'edit',
              type: ACTION_TYPE.ITEM,
              label: $localize`Edit`,
              visible: context !== ENTITY_CONTEXT.FORM,
              click: () => {
                this.open(entity.id);
              }
            },
            {
              id: 'delete',
              type: ACTION_TYPE.ITEM,
              label: $localize`Delete`,
              visible: [ENTITY_CONTEXT.LIST, ENTITY_CONTEXT.SEARCH].includes(context ?? ''),
              click: () => {
                this.delete(entity.id);
              }
            }
          ].filter((a) => a.visible)
        }
      ].filter((g) => g.children.length > 0);
    }
    return actions;
  }
  public async open(id?: string, view?: boolean): Promise<Operation> {
    return new Promise<Operation>((resolve) => {
      const config = {
        data: {
          id
        },
        panelClass: ['ft-dialog', 'ft-dialog--stacked'],
        height: '100vh',
        width: '600px',
        position: {
          left: 'auto',
          right: '0'
        }
      };
      if (!view) {
        const dialogRef = this.dialog.open(EntityForm, { ...config, disableClose: true });
        const ref = {
          sub: null as ReturnType<typeof dialogRef.componentInstance.afterSubmit.subscribe> | null
        };
        ref.sub = dialogRef.componentInstance.afterSubmit.subscribe((operation) => {
          if (operation) {
            ref.sub?.unsubscribe();
            resolve(operation);
          }
        });
      } else {
        this.dialog.open(EntityDetail, config);
      }
    });
  }
  public async search(): Promise<Entity> {
    return new Promise<Entity>((resolve) => {
      const dialogRef = this.dialog.open(EntitySearch, {
        panelClass: ['ft-dialog'],
        width: '400px'
      });
      const ref = {
        sub: null as ReturnType<typeof dialogRef.componentInstance.selected.subscribe> | null
      };
      ref.sub = dialogRef.componentInstance.selected.subscribe((entity: Entity | null) => {
        if (entity) {
          ref.sub?.unsubscribe();
          resolve(entity);
        }
      });
    });
  }
}

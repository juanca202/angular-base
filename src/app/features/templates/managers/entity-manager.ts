import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EntityDetail } from '../components/entity-detail/entity-detail';
import { EntitySearch } from '../components/entity-search/entity-search';

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
  private readonly dialog = inject(MatDialog);

  public open(id?: string) {
    this.dialog.open(EntityDetail, {
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
    });
  }
  public search() {
    this.dialog.open(EntitySearch, {
      panelClass: ['ft-dialog'],
      width: '400px'
    });
  }
}

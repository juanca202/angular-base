import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ContactDetail } from '@/features/contacts/components/contact-detail/contact-detail';
import { ContactSearch } from '@/features/contacts/components/contact-search/contact-search';

/**
 * Coordinates the experience for opening contact detail dialogs.
 *
 * @remarks
 * Centralizing the dialog logic keeps components lightweight and allows us to
 * tweak presentation rules in a single place.
 */
@Injectable({
  providedIn: 'root'
})
export class ContactManager {
  private readonly dialog = inject(MatDialog);

  public open(id?: string): void {
    this.dialog.open(ContactDetail, {
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

  public search(): void {
    this.dialog.open(ContactSearch, {
      panelClass: ['ft-dialog'],
      width: '400px'
    });
  }
}

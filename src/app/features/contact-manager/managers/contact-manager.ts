import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { MessageService } from '@factor_ec/ui';

import { Action } from '@/shared/models/action';
import { ACTION_TYPE } from '@/shared/constants/action-type';
import { Operation } from '@/core/models/operation';
import { OPERATION_TYPE, OperationType } from '@/core/constants/operation-type';

import { CONTACT_CONTEXT, type ContactContext } from '../constants/contact-context';
import type { Contact } from '../models/contact';
import type { ContactRelationshipView } from '../models/ui';
import { ContactsRepository } from '../repositories/contacts-repository';
import { ContactRelationshipsRepository } from '../repositories/contact-relationships-repository';

import { ContactDetail } from '../components/contact-detail/contact-detail';
import { ContactForm } from '../components/contact-form/contact-form';
import { ContactSearch } from '../components/contact-search/contact-search';
import { ContactRelationshipForm } from '../components/contact-relationship-form/contact-relationship-form';

@Injectable({
  providedIn: 'root'
})
export class ContactManager {
  private readonly contactsRepository = inject(ContactsRepository);
  private readonly contactRelationshipsRepository = inject(ContactRelationshipsRepository);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  private readonly contactMutations = this.contactsRepository.mutations();

  public async deleteContact(id?: string): Promise<void> {
    const value = await firstValueFrom(
      this.messageService.show($localize`Are you sure you want to delete this contact?`, {
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
      await this.contactMutations.delete(id);
      this.messageService.show($localize`Contact deleted successfully.`, {
        class: 'ft-message--success',
        icon: 'check--circle'
      });
    }
  }

  public getContextMenu(contact: Contact | null, context?: ContactContext): Action[] {
    if (!contact?.id) {
      return [];
    }

    const actions: Action[] = [
      {
        id: 'generalGroup',
        type: ACTION_TYPE.GROUP,
        children: [
          {
            id: 'edit',
            type: ACTION_TYPE.ITEM,
            label: $localize`Edit`,
            visible: context !== CONTACT_CONTEXT.FORM,
            click: () => this.openContact(contact.id)
          },
          {
            id: 'delete',
            type: ACTION_TYPE.ITEM,
            label: $localize`Delete`,
            visible: [
              CONTACT_CONTEXT.LIST,
              CONTACT_CONTEXT.SEARCH,
              CONTACT_CONTEXT.DETAIL
            ].includes(context ?? ''),
            click: () => this.deleteContact(contact.id)
          }
        ].filter((a) => a.visible)
      }
    ].filter((g) => g.children.length > 0);

    return actions;
  }

  public async openContact(id?: string, view?: boolean): Promise<Operation> {
    return new Promise<Operation>((resolve) => {
      const config = {
        data: { id },
        panelClass: ['ft-dialog', 'ft-dialog--stacked'],
        height: '100vh',
        width: '600px',
        position: { left: 'auto', right: '0' }
      };

      if (!view) {
        const dialogRef = this.dialog.open(ContactForm, config);
        const sub = dialogRef.componentInstance.afterSubmit.subscribe((operation) => {
          if (operation) resolve(operation);
          sub.unsubscribe();
        });
      } else {
        this.dialog.open(ContactDetail, config);
      }
    });
  }

  public async searchContact(excludeIds: string[] = []): Promise<Contact> {
    return new Promise<Contact>((resolve) => {
      const dialogRef = this.dialog.open(ContactSearch, {
        data: { excludeIds },
        panelClass: ['ft-dialog'],
        width: '400px'
      });
      const sub = dialogRef.componentInstance.selected.subscribe((contact) => {
        if (contact) resolve(contact);
        sub.unsubscribe();
      });
    });
  }

  public async openRelationshipForm(args: {
    contactId: string;
    relationship?: ContactRelationshipView;
    excludeIds?: string[];
  }): Promise<void> {
    return new Promise<void>((resolve) => {
      const dialogRef = this.dialog.open(ContactRelationshipForm, {
        data: {
          contactId: args.contactId,
          relationship: args.relationship,
          excludeIds: args.excludeIds ?? []
        },
        panelClass: ['ft-dialog'],
        width: '500px'
      });
      const sub = dialogRef.componentInstance.afterSubmit.subscribe(() => {
        resolve();
        sub.unsubscribe();
      });
    });
  }

  public toOperation(type: OperationType, entity: any): Operation {
    return { type, entity };
  }

  public inferOperationType(id?: string): OperationType {
    return id ? OPERATION_TYPE.UPDATE : OPERATION_TYPE.CREATE;
  }
}

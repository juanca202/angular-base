import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import {
  IconComponent,
  MessageService,
  ObserveIntersectingDirective,
  ProgressComponent
} from '@factor_ec/ui';

import { LayoutManager } from '@/core/services/layout-manager';

import { CONTACT_CONTEXT } from '../../constants/contact-context';
import { ContactManager } from '../../managers/contact-manager';
import { ContactRelationshipsRepository } from '../../repositories/contact-relationships-repository';
import { ContactsRepository } from '../../repositories/contacts-repository';
import type { ContactRelationshipType } from '../../models/contact-relationship';
import type { ContactRelationshipView } from '../../models/ui';

const RELATIONSHIP_LABEL: Record<ContactRelationshipType, string> = {
  FRIEND: $localize`Friend`,
  FAMILY: $localize`Family`,
  COLLEAGUE: $localize`Colleague`,
  MANAGER: $localize`Manager`,
  DIRECT_REPORT: $localize`Direct report`,
  PARTNER: $localize`Partner`,
  CLIENT: $localize`Client`,
  SUPPLIER: $localize`Supplier`
};

@Component({
  selector: 'app-contact-detail',
  imports: [
    IconComponent,
    ObserveIntersectingDirective,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    ProgressComponent
  ],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactDetail implements OnInit, OnDestroy {
  public readonly contactManager = inject(ContactManager);
  private readonly contactsRepository = inject(ContactsRepository);
  private readonly relationshipsRepository = inject(ContactRelationshipsRepository);
  private readonly messageService = inject(MessageService);

  public readonly data = inject(MAT_DIALOG_DATA);
  public readonly layoutManager = inject(LayoutManager);

  public readonly CONTACT_CONTEXT = CONTACT_CONTEXT;
  public readonly RELATIONSHIP_LABEL = RELATIONSHIP_LABEL;

  public readonly contact = this.contactsRepository.find();
  public readonly relationships = this.relationshipsRepository.findByContact();

  public readonly relationshipMutations = this.relationshipsRepository.mutations();

  ngOnInit(): void {
    if (this.data?.id) {
      this.contact.load(this.data.id);
      this.relationships.load(this.data.id);
    }
  }

  ngOnDestroy(): void {
    this.contact.destroy();
    this.relationships.destroy();
  }

  public async addRelationship(): Promise<void> {
    const current = this.contact.value();
    if (!current?.id) return;

    const excludeIds = [
      current.id,
      ...(this.relationships.value() ?? []).map((r) => r.relatedContactId)
    ];

    await this.contactManager.openRelationshipForm({
      contactId: current.id,
      excludeIds
    });

    await this.relationships.refresh();
  }

  public async editRelationship(relationship: ContactRelationshipView): Promise<void> {
    const current = this.contact.value();
    if (!current?.id) return;

    await this.contactManager.openRelationshipForm({
      contactId: current.id,
      relationship,
      excludeIds: [current.id]
    });

    await this.relationships.refresh();
  }

  public async deleteRelationship(relationship: ContactRelationshipView): Promise<void> {
    try {
      await this.relationshipMutations.delete(relationship.id);
      this.messageService.show($localize`Relationship deleted.`, {
        class: 'ft-message--success',
        icon: 'check--circle'
      });
    } finally {
      // keep list fresh even on error
      await this.relationships.refresh().catch(() => null);
    }
  }
}

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent, ObserveIntersectingDirective, ProgressComponent } from '@factor_ec/ui';

import { LayoutManager } from '@/core/services/layout-manager';

import { CONTACT_CONTEXT } from '../../constants/contact-context';
import { ContactManager } from '../../managers/contact-manager';
import { ContactsRepository } from '../../repositories/contacts-repository';

@Component({
  selector: 'app-contact-list',
  imports: [
    MatButtonModule,
    MatMenuModule,
    IconComponent,
    ObserveIntersectingDirective,
    ProgressComponent
  ],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactList implements OnInit, OnDestroy {
  public readonly contactManager = inject(ContactManager);
  private readonly contactsRepository = inject(ContactsRepository);
  public readonly layoutManager = inject(LayoutManager);

  public readonly CONTACT_CONTEXT = CONTACT_CONTEXT;

  public readonly contacts = this.contactsRepository.findBy();

  ngOnInit(): void {
    this.contacts.load();
  }

  ngOnDestroy(): void {
    this.contacts.destroy();
  }
}

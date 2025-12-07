import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { AvatarComponent, IconComponent } from '@factor_ec/ui';

import { ContactRepository } from '@/features/contacts/repositories/contact-repository';
import { ContactManager } from '@/features/contacts/managers/contact-manager';
import { Contact } from '@/features/contacts/models/contact';
import { LayoutManager } from '@/core/services/layout-manager';
import { MatButtonModule } from '@angular/material/button';

/**
 * Provides a search interface for contacts.
 *
 * @remarks
 * Allows users to search and quickly navigate to contact details.
 */
@Component({
  selector: 'app-contact-search',
  imports: [
    CommonModule,
    AvatarComponent,
    IconComponent,
    MatButtonModule,
    MatDialogContent,
    ReactiveFormsModule
  ],
  templateUrl: './contact-search.html',
  styleUrl: './contact-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSearch implements OnInit, OnDestroy {
  // Dependency injection
  private readonly dialogRef = inject(MatDialogRef<ContactSearch>);
  private readonly contactRepository = inject(ContactRepository);
  public readonly contactManager = inject(ContactManager);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly contacts = this.contactRepository.findBy();
  public form = this.formBuilder.group({
    query: ['']
  });
  private readonly searchQuery = signal<string>('');
  private readonly destroy$ = new Subject<void>();

  public readonly filteredContacts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allContacts = this.contacts.value() || [];

    if (!query) {
      return allContacts;
    }

    return allContacts.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.phone.includes(query) ||
        (contact.company && contact.company.toLowerCase().includes(query))
    );
  });

  ngOnInit(): void {
    this.contacts.load();
    this.form
      .get('query')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.searchQuery.set(value || '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.contacts.destroy();
  }

  public showContact(contact: Contact): void {
    this.dialogRef.close();
    this.contactManager.open(contact.id);
  }
}

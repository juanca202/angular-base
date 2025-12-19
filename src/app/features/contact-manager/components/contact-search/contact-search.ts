import { ChangeDetectionStrategy, Component, inject, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { AvatarComponent, IconComponent } from '@factor_ec/ui';

import { LayoutManager } from '@/core/services/layout-manager';

import { ContactsRepository } from '../../repositories/contacts-repository';
import type { Contact } from '../../models/contact';

@Component({
  selector: 'app-contact-search',
  imports: [AvatarComponent, IconComponent, MatButtonModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './contact-search.html',
  styleUrl: './contact-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSearch implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ContactSearch>);
  private readonly contactsRepository = inject(ContactsRepository);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as {
    excludeIds?: string[];
  } | null;

  public readonly contacts = this.contactsRepository.findBy();
  public readonly form = this.formBuilder.group({
    query: ['']
  });

  public readonly selected = output<Contact>();

  ngOnInit(): void {
    this.contacts.load();
  }

  public getFiltered(): Contact[] {
    const exclude = new Set(this.data?.excludeIds ?? []);
    const query = (this.form.value.query ?? '').toString().trim().toLowerCase();

    return (this.contacts.value() ?? [])
      .filter((c) => !exclude.has(c.id))
      .filter((c) => {
        if (!query) return true;
        const hay = `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase();
        return hay.includes(query);
      });
  }

  public select(contact: Contact): void {
    this.dialogRef.close();
    this.selected.emit(contact);
  }
}

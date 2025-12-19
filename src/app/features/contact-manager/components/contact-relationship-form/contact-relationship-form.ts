import { ChangeDetectionStrategy, Component, inject, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { IconComponent, ProgressComponent } from '@factor_ec/ui';

import { ContactManager } from '../../managers/contact-manager';
import type { Contact } from '../../models/contact';
import type { ContactRelationshipType } from '../../models/contact-relationship';
import type { ContactRelationshipView } from '../../models/ui';
import { ContactRelationshipsRepository } from '../../repositories/contact-relationships-repository';

type DialogData = {
  contactId: string;
  relationship?: ContactRelationshipView;
  excludeIds?: string[];
};

const RELATIONSHIP_OPTIONS: { value: ContactRelationshipType; label: string }[] = [
  { value: 'FRIEND', label: $localize`Friend` },
  { value: 'FAMILY', label: $localize`Family` },
  { value: 'COLLEAGUE', label: $localize`Colleague` },
  { value: 'MANAGER', label: $localize`Manager` },
  { value: 'DIRECT_REPORT', label: $localize`Direct report` },
  { value: 'PARTNER', label: $localize`Partner` },
  { value: 'CLIENT', label: $localize`Client` },
  { value: 'SUPPLIER', label: $localize`Supplier` }
];

@Component({
  selector: 'app-contact-relationship-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    IconComponent,
    ProgressComponent
  ],
  templateUrl: './contact-relationship-form.html',
  styleUrl: './contact-relationship-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactRelationshipForm implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ContactRelationshipForm>);
  private readonly data = inject(MAT_DIALOG_DATA) as DialogData;
  private readonly formBuilder = inject(FormBuilder);
  private readonly contactManager = inject(ContactManager);
  private readonly relationshipsRepository = inject(ContactRelationshipsRepository);

  public readonly relationshipMutations = this.relationshipsRepository.mutations();

  public readonly RELATIONSHIP_OPTIONS = RELATIONSHIP_OPTIONS;

  public readonly selectedContact = signal<Contact | null>(null);

  public readonly form = this.formBuilder.group({
    relatedContactId: ['', [Validators.required]],
    type: ['', [Validators.required]]
  });

  public readonly afterSubmit = output<void>();

  ngOnInit(): void {
    if (this.data.relationship) {
      this.form.patchValue({
        relatedContactId: this.data.relationship.relatedContactId,
        type: this.data.relationship.type
      });
      this.form.controls.relatedContactId.disable();
      this.selectedContact.set({
        id: this.data.relationship.relatedContactId,
        firstName: this.data.relationship.relatedContactName.split(' ')[0] ?? '',
        lastName: this.data.relationship.relatedContactName.split(' ').slice(1).join(' ') ?? '',
        email: '',
        phone: ''
      });
    }
  }

  public async pickContact(): Promise<void> {
    const excludeIds = this.data.excludeIds ?? [];
    const contact = await this.contactManager.searchContact(excludeIds);
    this.selectedContact.set(contact);
    this.form.patchValue({ relatedContactId: contact.id });
  }

  public async submit(): Promise<void> {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const type = raw.type as ContactRelationshipType;
    const relatedContactId = raw.relatedContactId as string;

    try {
      if (this.data.relationship) {
        await this.relationshipMutations.update({ id: this.data.relationship.id, type });
      } else {
        await this.relationshipMutations.create({
          contactId: this.data.contactId,
          relatedContactId,
          type
        });
      }

      this.dialogRef.close();
      this.afterSubmit.emit();
    } catch {
      // handled by repository helper
    }
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IconComponent, ProgressComponent } from '@factor_ec/ui';
import { LayoutManager } from '@/core/services/layout-manager';
import { ContactRepository } from '@/features/contacts/repositories/contact-repository';
import { MatButtonModule } from '@angular/material/button';
import { ErrorMessagePipe } from '@/core/pipes/error-message-pipe';

/**
 * Presents the contact detail drawer, enabling both edition and creation flows
 * backed by {@link ContactRepository}.
 *
 * @remarks
 * The component keeps track of the active resource signal and submits mutations
 * depending on whether an identifier is provided through dialog data.
 */
@Component({
  selector: 'app-contact-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ProgressComponent,
    ErrorMessagePipe
  ],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactDetail implements OnInit, OnDestroy {
  // Dependency injection
  private readonly contactRepository = inject(ContactRepository);
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);
  private readonly dialogRef = inject(MatDialogRef<ContactDetail>);

  // Properties
  public readonly contact = this.contactRepository.find();
  public readonly contactMutations = this.contactRepository.mutations();
  public readonly form: FormGroup = this.formBuilder.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    company: [''],
    position: [''],
    notes: ['']
  });

  ngOnInit(): void {
    if (this.data?.id) {
      this.contact.load(this.data.id).then((contact) => {
        if (contact) {
          this.form.patchValue(contact);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.contact.destroy();
  }

  public async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const formData = this.form.value;
      try {
        if (this.data?.id) {
          // Update existing contact
          await this.contactMutations.update({ ...formData, id: this.data.id });
        } else {
          // Create new contact
          await this.contactMutations.create(formData);
        }
        // Close dialog on success
        this.dialogRef.close();
      } catch {
        // Error is already handled by the repository
      }
    }
  }
}

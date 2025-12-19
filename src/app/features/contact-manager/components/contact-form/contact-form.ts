import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

import {
  IconComponent,
  MessageService,
  ObserveIntersectingDirective,
  ProgressComponent
} from '@factor_ec/ui';

import { LayoutManager } from '@/core/services/layout-manager';
import { ErrorMessagePipe } from '@/core/pipes/error-message-pipe';
import { OPERATION_TYPE } from '@/core/constants/operation-type';
import type { Operation } from '@/core/models/operation';

import { CONTACT_CONTEXT } from '../../constants/contact-context';
import { ContactManager } from '../../managers/contact-manager';
import type { Contact } from '../../models/contact';
import { ContactsRepository } from '../../repositories/contacts-repository';

@Component({
  selector: 'app-contact-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    ObserveIntersectingDirective,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    ProgressComponent,
    ErrorMessagePipe
  ],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactForm implements OnInit, OnDestroy {
  public readonly contactManager = inject(ContactManager);
  private readonly contactsRepository = inject(ContactsRepository);
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);
  private readonly dialogRef = inject(MatDialogRef<ContactForm>);
  private readonly messageService = inject(MessageService);

  public readonly CONTACT_CONTEXT = CONTACT_CONTEXT;

  public readonly contact = this.contactsRepository.find();
  public readonly contactMutations = this.contactsRepository.mutations();

  public readonly form: FormGroup = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.email, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(20)]],
    notes: ['', [Validators.maxLength(500)]]
  });

  public readonly afterSubmit = output<Operation | null>();

  ngOnInit(): void {
    if (this.data?.id) {
      this.contact.load(this.data.id).then((contact) => {
        if (contact) this.form.patchValue(contact);
      });
    }
  }

  ngOnDestroy(): void {
    this.contact.destroy();
  }

  public async submit(): Promise<void> {
    if (!this.form.valid) return;

    const formData = this.form.value;

    try {
      let entity: Contact | null;
      let type: Operation['type'];

      if (this.data?.id) {
        entity = await this.contactMutations.update({ ...formData, id: this.data.id });
        type = OPERATION_TYPE.UPDATE;
      } else {
        entity = await this.contactMutations.create(formData);
        type = OPERATION_TYPE.CREATE;
      }

      this.dialogRef.close();
      this.messageService.show($localize`Saved successfully.`);
      this.afterSubmit.emit({ type, entity });
    } catch {
      // Error is handled by repository helpers
    }
  }
}

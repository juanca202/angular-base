import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MessageService } from '@factor_ec/ui';

import { Contact } from 'app/contacts/models/contact';

type ContactFormControls = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
};

const PHONE_PATTERN = /^[0-9()+\-\s]{7,20}$/;

@Component({
  selector: 'app-contact-create',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormField, MatInputModule],
  templateUrl: './contact-create.html',
  styleUrl: './contact-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-contact-create ft-d-f ft-jc-c ft-p-4',
  },
})
export class ContactCreate {
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  public readonly contactForm: FormGroup<ContactFormControls> = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN), Validators.maxLength(25)]],
  });

  private readonly trimmedValue = (value: string) => value.trim();

  public readonly submitting = signal(false);
  public readonly submitted = signal(false);
  public readonly createdContact = signal<Contact | null>(null);

  public hasError(controlName: keyof ContactFormControls, errorCode: string): boolean {
    const control = this.contactForm.controls[controlName];
    return (
      !!control &&
      control.hasError(errorCode) &&
      (control.dirty || control.touched || this.submitted())
    );
  }

  public onSubmit(): void {
    this.submitted.set(true);
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formValue = this.contactForm.getRawValue();
    const contact: Contact = {
      firstName: this.trimmedValue(formValue.firstName),
      lastName: this.trimmedValue(formValue.lastName),
      email: this.trimmedValue(formValue.email),
      phone: this.trimmedValue(formValue.phone),
    };

    this.createdContact.set(contact);
    this.messageService.show($localize`Contacto creado correctamente`);
    this.resetForm();
    this.submitting.set(false);
  }

  private resetForm(): void {
    this.contactForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    this.contactForm.markAsPristine();
    this.contactForm.markAsUntouched();
    this.submitted.set(false);
  }
}

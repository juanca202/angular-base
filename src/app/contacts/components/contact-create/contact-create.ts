import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IconComponent } from '@factor_ec/ui';

type ContactFormValue = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

@Component({
  selector: 'app-contact-create',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    IconComponent,
  ],
  templateUrl: './contact-create.html',
  styleUrl: './contact-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-page ft-page--form',
  },
})
export class ContactCreate {
  private readonly formBuilder: NonNullableFormBuilder = inject(FormBuilder).nonNullable;

  public readonly contactForm = this.formBuilder.group({
    firstName: this.formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    lastName: this.formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(120)],
    }),
    phone: this.formBuilder.control('', {
      validators: [
        Validators.required,
        Validators.maxLength(25),
        Validators.pattern(/^[0-9()+\-\s]+$/),
      ],
    }),
  });

  public readonly isSubmitting = signal(false);
  public readonly submittedContact = signal<ContactFormValue | null>(null);
  public readonly disableSubmit = computed(
    () => this.contactForm.invalid || this.isSubmitting(),
  );

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    try {
      const newContact = this.contactForm.getRawValue();
      this.submittedContact.set(newContact);
      this.contactForm.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm(): void {
    this.contactForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    this.submittedContact.set(null);
  }

  formControlInvalid(controlName: keyof ContactFormValue): boolean {
    const control = this.contactForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: keyof ContactFormValue): string {
    const control = this.contactForm.controls[controlName];

    if (control.hasError('required')) {
      return $localize`Este campo es obligatorio`;
    }
    if (control.hasError('email')) {
      return $localize`Ingresa un correo electrónico válido`;
    }
    if (control.hasError('maxlength')) {
      return $localize`Has superado la longitud permitida`;
    }
    if (control.hasError('pattern')) {
      return $localize`Ingresa un número de teléfono válido`;
    }

    return $localize`Valor inválido`;
  }
}

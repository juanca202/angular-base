import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

import { IconComponent, ProgressComponent, MessageService } from '@factor_ec/ui';

import { AppManager } from 'app/core/app-manager';
import { lastValueFrom } from 'rxjs';
import { RestService } from 'app/core/rest.service';
import { ErrorMessagePipe } from 'app/core/pipes/error-message-pipe';

@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    IconComponent,
    ProgressComponent,
    ErrorMessagePipe,
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {
  public appManager = inject(AppManager);
  private restService = inject(RestService);
  private dialogRef = inject(MatDialogRef);
  public form: FormGroup = new FormGroup({});
  private formBuilder = inject(FormBuilder);
  private messageService = inject(MessageService);
  public newPasswordVisible = signal<boolean>(false);
  public notEqualMessage = $localize`New password is not the same`;
  public passwordVisible = signal<boolean>(false);
  public submitting = signal<boolean>(false);

  constructor() {
    this.initForm();
  }

  confirmPasswordValidator(control: AbstractControl): Record<string, any> | null {
    let value: Record<string, any> | null = null;
    if (control && control.parent && control.parent.get('newPassword')?.value !== control.value) {
      value = { notEqual: true, fieldName: $localize`New password` };
    }
    return value;
  }
  private initForm(): void {
    this.form = this.formBuilder.group({
      password: ['', Validators.required],
      newPassword: ['', [Validators.required, this.passwordValidator()]],
      confirmPassword: ['', [Validators.required, this.confirmPasswordValidator]],
    });
  }
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value || '';

      // Reglas de validación
      const hasMinLength = value.length >= 8;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasNumber = /\d/.test(value);

      // Si no cumple alguna regla, devolver errores específicos
      const errors: any = {};
      if (!hasMinLength) errors.minLength = $localize`Must contain at least 8 characters`;
      if (!hasUpperCase) errors.upperCase = $localize`Must contain at least 1 capital letter`;
      if (!hasLowerCase) errors.lowerCase = $localize`Must contain at least 1 lowercase letter`;
      if (!hasSpecialCharacter)
        errors.specialCharacter = $localize`Must contain at least 1 special character`;
      if (!hasNumber) errors.number = $localize`Must contain 1 number`;

      // Retornar errores si hay alguno, o null si todo está bien
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }
  async submit(): Promise<void> {
    if (this.form.valid) {
      try {
        this.submitting.set(true);
        this.form.disable();
        await lastValueFrom(
          this.restService.post('change-password', {
            password: this.form.value.password,
            newPassword: this.form.value.newPassword,
          }),
        );
        this.dialogRef.close();
        this.messageService.show($localize`Your password was updated successfully.`, {
          verticalPosition: 'top',
        });
      } catch (err: any) {
        this.messageService.show(err.error?.detail || err.message, {
          type: 'modal',
        });
      } finally {
        this.form.enable();
        this.submitting.set(false);
      }
    }
  }
  toggleNewPasswordVisible(): void {
    this.newPasswordVisible.set(!this.newPasswordVisible());
  }
  togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

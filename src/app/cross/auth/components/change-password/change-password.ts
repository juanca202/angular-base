import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

import { IconComponent, ProgressComponent, MessageService } from '@factor_ec/ui';
import { lastValueFrom } from 'rxjs';

import { AppManager } from 'app/core/services/app-manager';
import { ErrorMessagePipe } from 'app/shared/pipes/error-message-pipe';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from 'app/core/utils/async-repository';

@Component({
  selector: 'ft-change-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    IconComponent,
    ProgressComponent,
    ErrorMessagePipe
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePassword {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly httpClient = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  // Properties
  public readonly form: FormGroup;
  public readonly newPasswordVisible = signal<boolean>(false);
  public readonly notEqualMessage = $localize`New password is not the same`;
  public readonly passwordVisible = signal<boolean>(false);
  public readonly submitting = signal<boolean>(false);

  constructor() {
    this.form = this.formBuilder.group({
      password: ['', Validators.required],
      newPassword: ['', [Validators.required, this.passwordValidator()]],
      confirmPassword: ['', [Validators.required, this.confirmPasswordValidator]]
    });
  }

  private confirmPasswordValidator(control: AbstractControl): Record<string, any> | null {
    let value: Record<string, any> | null = null;
    if (control && control.parent && control.parent.get('newPassword')?.value !== control.value) {
      value = { notEqual: true, fieldName: $localize`New password` };
    }
    return value;
  }
  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value || '';

      // Validation rules
      const hasMinLength = value.length >= 8;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasNumber = /\d/.test(value);

      // If any rule fails, return specific errors
      const errors: any = {};
      if (!hasMinLength) errors.minLength = $localize`Must contain at least 8 characters`;
      if (!hasUpperCase) errors.upperCase = $localize`Must contain at least 1 capital letter`;
      if (!hasLowerCase) errors.lowerCase = $localize`Must contain at least 1 lowercase letter`;
      if (!hasSpecialCharacter)
        errors.specialCharacter = $localize`Must contain at least 1 special character`;
      if (!hasNumber) errors.number = $localize`Must contain 1 number`;

      // Return errors if any, or null if everything is fine
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }
  public async submit(): Promise<void> {
    if (this.form.valid) {
      try {
        this.submitting.set(true);
        this.form.disable();
        await lastValueFrom(
          this.httpClient.post(getApiUrl('change-password'), {
            password: this.form.value.password,
            newPassword: this.form.value.newPassword
          })
        );
        this.dialogRef.close();
        this.messageService.show($localize`Your password was updated successfully.`, {
          verticalPosition: 'top'
        });
      } catch (err: any) {
        this.messageService.show(err.error?.detail || err.message, {
          type: 'modal'
        });
      } finally {
        this.form.enable();
        this.submitting.set(false);
      }
    }
  }
  public toggleNewPasswordVisible(): void {
    this.newPasswordVisible.set(!this.newPasswordVisible());
  }
  public togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

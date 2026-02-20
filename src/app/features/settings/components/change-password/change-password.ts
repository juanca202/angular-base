import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required, submit, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

import { IconComponent, ProgressComponent, MessageService } from '@factor_ec/ui';
import { lastValueFrom } from 'rxjs';

import { AppManager } from '@/core/services/app-manager';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { getApiUrl } from '@/core/utils/async-resources';

interface ChangePasswordModel {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Renders the password change dialog, validating strong password requirements
 * and coordinating the mutation that persists the new credential.
 *
 * @remarks
 * The component exposes helper validators to keep the template declarative and
 * communicates status updates via {@link MessageService}.
 */
@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule,
    FormField,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    IconComponent,
    ProgressComponent
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePassword {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly httpClient = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  // Properties
  public readonly changeModel = signal<ChangePasswordModel>({
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  public readonly changeForm = form(this.changeModel, (schemaPath) => {
    required(schemaPath.password, { message: $localize`Field required` });
    required(schemaPath.newPassword, { message: $localize`Field required` });
    validate(schemaPath.newPassword, ({ value }) => {
      const v = value() || '';
      const errs: Array<{ kind: string; message: string }> = [];
      if (v.length < 8)
        errs.push({ kind: 'minLength', message: $localize`Must contain at least 8 characters` });
      if (!/[A-Z]/.test(v))
        errs.push({
          kind: 'upperCase',
          message: $localize`Must contain at least 1 capital letter`
        });
      if (!/[a-z]/.test(v))
        errs.push({
          kind: 'lowerCase',
          message: $localize`Must contain at least 1 lowercase letter`
        });
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(v))
        errs.push({
          kind: 'specialCharacter',
          message: $localize`Must contain at least 1 special character`
        });
      if (!/\d/.test(v)) errs.push({ kind: 'number', message: $localize`Must contain 1 number` });
      return errs.length > 0 ? errs : null;
    });
    required(schemaPath.confirmPassword, { message: $localize`Field required` });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schemaPath.newPassword)) {
        return { kind: 'notEqual', message: this.notEqualMessage };
      }
      return null;
    });
  });
  public readonly newPasswordVisible = signal<boolean>(false);
  public readonly notEqualMessage = $localize`New password is not the same`;
  public readonly passwordVisible = signal<boolean>(false);
  public readonly submitting = signal<boolean>(false);

  public async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    submit(this.changeForm, async () => {
      try {
        this.submitting.set(true);
        const { password, newPassword } = this.changeModel();
        await lastValueFrom(
          this.httpClient.post(getApiUrl('change-password'), { password, newPassword })
        );
        this.dialogRef.close();
        this.messageService.show($localize`Your password was updated successfully.`, {
          verticalPosition: 'top'
        });
      } catch (err: unknown) {
        if (err instanceof HttpErrorResponse) {
          this.messageService.show(err.error?.detail || err.message, {
            type: 'modal'
          });
        }
      } finally {
        this.submitting.set(false);
      }
    });
  }

  public toggleNewPasswordVisible(): void {
    this.newPasswordVisible.set(!this.newPasswordVisible());
  }
  public togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }

  public hasNewPasswordError(kind: string): boolean {
    const errors = this.changeForm.newPassword().errors();
    return errors.some((e) => e.kind === kind);
  }
}

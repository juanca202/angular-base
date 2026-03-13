import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Progress, MessageService } from '@factor_ec/ui';
import { GoogleTagManager } from '@factor_ec/utils';

import { environment } from '@/environments/environment';
import { CommonModule } from '@angular/common';

/**
 * Presents the dialog that lets the user request password reset instructions.
 *
 * @remarks
 * The component validates the input email and triggers the backend workflow while
 * surfacing UX feedback via {@link MessageService}.
 */
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormField, MatButtonModule, MatDialogModule, MatInputModule, Progress],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPassword {
  // Dependency injection
  private readonly dialogRef = inject<MatDialogRef<ForgotPassword>>(MatDialogRef);
  private readonly googleTagManager = inject(GoogleTagManager);
  private readonly httpClient = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  // Properties
  public readonly forgotModel = signal<{ email: string }>({ email: '' });
  public readonly forgotForm = form(this.forgotModel, (schemaPath) => {
    required(schemaPath.email, { message: $localize`Field required` });
    email(schemaPath.email, { message: $localize`Type a valid email` });
  });
  public readonly submitting = signal<boolean>(false);

  public onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.forgotForm, async () => {
      this.submitting.set(true);
      try {
        await lastValueFrom(
          this.httpClient.post(environment.auth.forgotPasswordUrl, this.forgotModel())
        );
        this.submitting.set(false);
        this.googleTagManager.addVariable({
          event: 'forgot_password'
        });
        this.messageService.show(
          $localize`If your email is registered, then check your email for instructions to recover your password. If it doesn't arrive, be sure to check your spam folder.`,
          {
            type: 'modal'
          }
        );
        this.dialogRef.close();
      } catch (err: unknown) {
        this.submitting.set(false);
        const e = err as { error?: { detail?: string }; message?: string };
        this.messageService.show(e?.error?.detail || e?.message || '', {
          type: 'modal'
        });
      }
    });
  }
}

import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ProgressComponent, MessageService } from '@factor_ec/ui';
import { GoogleTagManagerService } from '@factor_ec/utils';

import { environment } from 'environments/environment';
import { CommonModule } from '@angular/common';
import { ErrorMessagePipe } from 'app/shared/pipes/error-message-pipe';

@Component({
  selector: 'ft-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    ProgressComponent,
    ErrorMessagePipe
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPassword {
  // Dependency injection
  private readonly dialogRef = inject<MatDialogRef<ForgotPassword>>(MatDialogRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  private readonly httpClient = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  // Properties
  public readonly form: FormGroup;
  public readonly submitting = signal<boolean>(false);

  constructor() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  public submit(): void {
    if (this.form.valid) {
      this.submitting.set(true);
      this.form.disable();
      this.httpClient.post(environment.auth.forgotPasswordUrl, this.form.value).subscribe(
        () => {
          this.submitting.set(false);
          this.googleTagManagerService.addVariable({
            event: 'forgot_password'
          });
          this.messageService.show(
            $localize`If your email is registered, then check your email for instructions to recover your password. If it doesn't arrive, be sure to check your spam folder.`,
            {
              type: 'modal'
            }
          );
          this.dialogRef.close();
        },
        (err) => {
          this.submitting.set(false);
          this.form.enable();
          this.messageService.show(err.error?.detail || err.message, {
            type: 'modal'
          });
        }
      );
    }
  }
}

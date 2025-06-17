import { Component, signal, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ProgressComponent, MessageService } from '@factor_ec/ui';
import { GoogleTagManagerService } from '@factor_ec/utils';

import { AppService } from 'app/core/app.service';
import { environment } from 'environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    ProgressComponent
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  appService = inject(AppService);
  private dialogRef = inject<MatDialogRef<ForgotPassword>>(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private googleTagManagerService = inject(GoogleTagManagerService);
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);

  form: FormGroup;
  submitting = signal<boolean>(false);

  constructor() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.submitting.set(true);
      this.form.disable();
      this.httpClient
        .post(environment.auth.forgotPasswordUrl, this.form.value)
        .subscribe(
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

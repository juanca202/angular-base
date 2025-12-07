import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

import { lastValueFrom } from 'rxjs';
import { IconComponent, MessageService, ProgressComponent } from '@factor_ec/ui';

import { AppManager } from '@/core/services/app-manager';
import { environment } from '@/environments/environment';
import { CommonModule } from '@angular/common';
import { ErrorMessagePipe } from '@/core/pipes/error-message-pipe';

/**
 * Allows users to define a new password after following a reset link that
 * includes a short-lived token.
 *
 * @remarks
 * The component enforces validation rules, provides usability helpers, and
 * communicates success or failure via {@link MessageService}.
 */
@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormField,
    MatInputModule,
    IconComponent,
    ProgressComponent,
    ErrorMessagePipe
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-auth ft-auth--form'
  }
})
export class ResetPassword {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  private readonly formBuilder = inject(FormBuilder);
  private readonly httpClient = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  // Properties
  public readonly form: FormGroup;
  public readonly submitting = signal<boolean>(false);
  public readonly notEqualMessage = $localize`New password is not the same`;
  public readonly passwordVisible = signal<boolean>(false);

  constructor() {
    this.form = this.formBuilder.group({
      token: this.route.snapshot.queryParamMap.get('token'),
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, this.confirmPasswordValidator]]
    });
    this.title.setTitle($localize`Reset password`);
  }

  private confirmPasswordValidator(control: AbstractControl): Record<string, any> | null {
    let value: Record<string, any> | null = null;
    if (control && control.parent && control.parent.get('password')?.value !== control.value) {
      value = { notEqual: true, fieldName: $localize`New password` };
    }
    return value;
  }
  public async submit(): Promise<void> {
    if (this.form.valid) {
      try {
        this.submitting.set(true);
        this.form.disable();
        await lastValueFrom(
          this.httpClient.post(environment.auth.resetPasswordUrl, {
            token: this.form.value.token,
            password: this.form.value.password
          })
        );
        this.submitting.set(false);
        this.router.navigateByUrl('/');
        setTimeout(() => {
          this.messageService.show($localize`Your password was changed successfully.`);
        }, 100);
      } catch (err: unknown) {
        this.submitting.set(false);
        this.form.enable();
        if (err instanceof HttpErrorResponse) {
          this.messageService.show(err.error?.detail || err.error.message || err.message, {
            type: 'modal'
          });
        }
      }
    }
  }
  public togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

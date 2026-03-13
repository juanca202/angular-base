import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { form, FormField, minLength, required, submit, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';

import { lastValueFrom } from 'rxjs';
import { Icon, MessageService, Progress } from '@factor_ec/ui';

import { AppManager } from '@/core/services/app-manager';
import { environment } from '@/environments/environment';
import { CommonModule } from '@angular/common';

interface ResetPasswordModel {
  token: string | null;
  password: string;
  confirmPassword: string;
}

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
    FormField,
    MatButtonModule,
    MatDialogModule,
    MatFormField,
    MatInputModule,
    Icon,
    Progress
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-auth ft-auth--form'
  }
})
export class ResetPassword implements OnInit {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  private readonly httpClient = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Properties
  public readonly resetModel = signal<ResetPasswordModel>({
    token: null,
    password: '',
    confirmPassword: ''
  });
  public readonly resetForm = form(this.resetModel, (schemaPath) => {
    required(schemaPath.password, { message: $localize`Field required` });
    minLength(schemaPath.password, 8, { message: $localize`Type at least 8 characters` });
    required(schemaPath.confirmPassword, { message: $localize`Field required` });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schemaPath.password)) {
        return { kind: 'notEqual', message: this.notEqualMessage };
      }
      return null;
    });
  });
  public readonly submitting = signal<boolean>(false);
  public readonly notEqualMessage = $localize`New password is not the same`;
  public readonly passwordVisible = signal<boolean>(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.resetModel.update((m) => ({ ...m, token }));
  }

  public async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    submit(this.resetForm, async () => {
      try {
        this.submitting.set(true);
        const { token, password } = this.resetModel();
        await lastValueFrom(
          this.httpClient.post(environment.auth.resetPasswordUrl, { token, password })
        );
        this.submitting.set(false);
        this.router.navigateByUrl('/');
        setTimeout(() => {
          this.messageService.show($localize`Your password was changed successfully.`);
        }, 100);
      } catch (err: unknown) {
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse) {
          this.messageService.show(err.error?.detail || err.error.message || err.message, {
            type: 'modal'
          });
        }
      }
    });
  }

  public togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

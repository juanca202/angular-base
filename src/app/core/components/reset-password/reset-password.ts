import { Component, HostBinding, signal, inject } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

import { lastValueFrom } from 'rxjs';
import {
  IconComponent,
  MessageService,
  ProgressComponent
} from '@factor_ec/ui';

import { AppService } from 'app/core/app.service';
import { environment } from 'environments/environment';
import { CommonModule } from '@angular/common';

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
    ProgressComponent
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
  appService = inject(AppService);
  private formBuilder = inject(FormBuilder);
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);

  form: FormGroup;
  submitting = signal<boolean>(false);
  notEqualMessage = $localize`New password is not the same`;
  passwordVisible = signal<boolean>(false);

  class = '';
  @HostBinding('class') get hostClasses(): string {
    return ['ft-auth', 'ft-auth--form', this.class].join(' ');
  }

  constructor() {
    this.form = this.formBuilder.group({
      token: this.route.snapshot.queryParamMap.get('token'),
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: [
        '',
        [Validators.required, this.confirmPasswordValidator]
      ]
    });
    this.title.setTitle($localize`Reset password`);
  }

  confirmPasswordValidator(
    control: AbstractControl
  ): Record<string, any> | null {
    let value: Record<string, any> | null = null;
    if (
      control &&
      control.parent &&
      control.parent.get('password')?.value !== control.value
    ) {
      value = { notEqual: true, fieldName: $localize`New password` };
    }
    return value;
  }
  async submit(): Promise<void> {
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
          this.messageService.show(
            $localize`Your password was changed successfully.`
          );
        }, 100);
      } catch (err: any) {
        this.submitting.set(false);
        this.form.enable();
        this.messageService.show(
          err.error?.detail || err.error.message || err.message,
          { type: 'modal' }
        );
      }
    }
  }
  togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

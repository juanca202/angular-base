import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

import { Subscription, interval, lastValueFrom } from 'rxjs';
import moment from 'moment';
import { StorageService } from '@factor_ec/utils';
import { MessageService, ProgressComponent, IconComponent } from '@factor_ec/ui';

import { AppManager } from 'app/core/services/app-manager';
import { AuthService } from 'app/auth/auth-service';
import { environment } from 'environments/environment';
import { ErrorMessagePipe } from 'app/core/pipes/error-message-pipe';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from 'app/core/services/rest-api';

@Component({
  selector: 'app-delete-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormField,
    MatInputModule,
    IconComponent,
    ProgressComponent,
    ErrorMessagePipe,
  ],
  templateUrl: './delete-user.html',
  styleUrl: './delete-user.scss',
})
export class DeleteUser implements OnInit, OnDestroy {
  AppManager = inject(AppManager);
  authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  private storageService = inject(StorageService);

  step1Form: FormGroup;
  step2Form: FormGroup;
  passwordVisible = signal<boolean>(false);
  submitting = signal<boolean>(false);
  submitted = signal<boolean>(false);

  codeExpiresIn = signal<string>('');
  codeTimeInterval!: Subscription;
  invalidUserEmail = $localize`Type the email registered in your account`;

  constructor() {
    this.step1Form = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(`^${this.authService.settings()?.user.email}$`),
        ],
      ],
    });
    this.step2Form = this.formBuilder.group({
      code: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.initCode();
  }
  ngOnDestroy(): void {
    if (this.codeTimeInterval) {
      this.codeTimeInterval.unsubscribe();
    }
  }
  initCode(): void {
    const deleteCodeExpiresAt = this.storageService.get(
      `${environment.sessionPrefix}_dce`,
      'local',
    );
    if (deleteCodeExpiresAt) {
      this.setCountDown(moment(deleteCodeExpiresAt));
    }
  }
  async generateCode(): Promise<void> {
    if (this.step1Form.valid) {
      try {
        this.submitting.set(true);
        this.step1Form.disable();
        const response = await lastValueFrom(
          this.httpClient.post(getApiUrl('generate-delete-code'), null),
        );
        this.setCountDown(moment(response));
        this.submitting.set(false);
        this.step1Form.enable();
      } catch (err: any) {
        this.submitting.set(false);
        this.messageService.show(err.error?.detail || err.error.message || err.message, {
          type: 'modal',
        });
        this.step1Form.enable();
      }
    }
  }
  async requestDelete(): Promise<void> {
    if (this.step2Form.valid) {
      try {
        this.step2Form.disable();
        this.submitting.set(true);
        await lastValueFrom(this.httpClient.post(getApiUrl('delete-user'), this.step2Form.value));
        this.submitting.set(false);
        this.authService.logout();
        this.storageService.delete('lastUser', 'local');
      } catch (err: any) {
        this.messageService.show(err.error?.detail || err.message, {
          type: 'modal',
        });
        this.submitting.set(false);
        this.step2Form.enable();
      }
    }
  }
  setCountDown(codeExpiresAt: moment.Moment): void {
    this.storageService.set(`${environment.sessionPrefix}_dce`, codeExpiresAt.toString(), 'local');
    const diff: number = codeExpiresAt.diff(moment());
    const codeExpired = diff <= 0;
    if (!codeExpired) {
      this.codeExpiresIn.set(moment.utc(diff).format('mm:ss'));
    }
    this.codeTimeInterval = interval(1000).subscribe(() => {
      const diff: number = codeExpiresAt.diff(moment());
      const codeExpired = diff <= 0;
      if (codeExpired) {
        this.codeExpiresIn.set('');
        this.codeTimeInterval.unsubscribe();
      } else {
        this.codeExpiresIn.set(moment.utc(diff).format('mm:ss'));
      }
    });
  }
  submit(): void {
    this.submitted.set(true);
    if (this.codeExpiresIn()) {
      this.requestDelete();
    } else {
      this.generateCode();
    }
  }
}

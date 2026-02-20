import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  inject,
  OnDestroy
} from '@angular/core';
import { email, form, FormField, required, validate } from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

import { Subscription, interval, lastValueFrom } from 'rxjs';
import { StorageService } from '@factor_ec/utils';
import { MessageService, ProgressComponent, IconComponent } from '@factor_ec/ui';

import { AppManager } from '@/core/services/app-manager';
import { AuthProvider } from 'auth-core';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { getApiUrl } from '@/core/utils/async-resources';
interface Step1Model {
  email: string;
}

interface Step2Model {
  code: string;
}

/**
 * Handles the two-step account deletion flow, including code generation,
 * countdown management, and confirmation submission.
 *
 * @remarks
 * The dialog enforces a verification code delivered externally and coordinates
 * backend requests to ensure the user explicitly confirms the operation.
 */
@Component({
  selector: 'app-delete-user',
  imports: [
    CommonModule,
    FormField,
    MatButtonModule,
    MatDialogModule,
    MatFormField,
    MatInputModule,
    IconComponent,
    ProgressComponent
  ],
  templateUrl: './delete-user.html',
  styleUrl: './delete-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteUser implements OnInit, OnDestroy {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  public readonly authProvider = inject(AuthProvider);
  private readonly httpClient = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly storageService = inject(StorageService);

  // Properties
  public readonly step1Model = signal<Step1Model>({ email: '' });
  public readonly step2Model = signal<Step2Model>({ code: '' });
  public readonly step1Form = form(this.step1Model, (schemaPath) => {
    required(schemaPath.email, { message: $localize`Field required` });
    email(schemaPath.email, { message: $localize`Type a valid email` });
    validate(schemaPath.email, ({ value }) => {
      const expected = this.authProvider.getUser()?.email;
      if (!expected) return null;
      if (value() !== expected) {
        return { kind: 'pattern', message: this.invalidUserEmail };
      }
      return null;
    });
  });
  public readonly step2Form = form(this.step2Model, (schemaPath) => {
    required(schemaPath.code, { message: $localize`Field required` });
  });
  public readonly passwordVisible = signal<boolean>(false);
  public readonly submitting = signal<boolean>(false);
  public readonly submitted = signal<boolean>(false);

  public readonly codeExpiresIn = signal<string>('');
  private codeTimeInterval: Subscription | null = null;
  public readonly invalidUserEmail = $localize`Type the email registered in your account`;

  ngOnInit(): void {
    this.initCode();
  }
  public ngOnDestroy(): void {
    if (this.codeTimeInterval) {
      this.codeTimeInterval.unsubscribe();
    }
  }
  private initCode(): void {
    const deleteCodeExpiresAt = this.storageService.get(
      `${environment.sessionPrefix}_dce`,
      'local'
    );
    if (deleteCodeExpiresAt) {
      this.setCountDown(new Date(deleteCodeExpiresAt));
    }
  }
  public async generateCode(): Promise<void> {
    if (this.step1Form().valid()) {
      try {
        this.submitting.set(true);
        const response = await lastValueFrom(
          this.httpClient.post<string | number | { expiresAt?: string | number }>(
            getApiUrl('generate-delete-code'),
            null
          )
        );
        const expiresAt = this.parseDateFromResponse(response);
        this.setCountDown(expiresAt);
        this.submitting.set(false);
      } catch (err: unknown) {
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse) {
          this.messageService.show(err.error?.detail || err.error.message || err.message, {
            type: 'modal'
          });
        }
      }
    }
  }
  public async requestDelete(): Promise<void> {
    if (this.step2Form().valid()) {
      try {
        this.submitting.set(true);
        await lastValueFrom(this.httpClient.post(getApiUrl('delete-user'), this.step2Model()));
        this.submitting.set(false);
        this.authProvider.logout();
        this.storageService.delete('lastUser', 'local');
      } catch (err: unknown) {
        if (err instanceof HttpErrorResponse) {
          this.messageService.show(err.error?.detail || err.message, {
            type: 'modal'
          });
        }
        this.submitting.set(false);
      }
    }
  }
  private setCountDown(codeExpiresAt: Date): void {
    this.storageService.set(
      `${environment.sessionPrefix}_dce`,
      codeExpiresAt.toISOString(),
      'local'
    );
    const diff: number = codeExpiresAt.getTime() - Date.now();
    const codeExpired = diff <= 0;
    if (!codeExpired) {
      this.codeExpiresIn.set(this.formatDuration(diff));
    }
    this.codeTimeInterval = interval(1000).subscribe(() => {
      const diff: number = codeExpiresAt.getTime() - Date.now();
      const codeExpired = diff <= 0;
      if (codeExpired) {
        this.codeExpiresIn.set('');
        this.codeTimeInterval?.unsubscribe();
      } else {
        this.codeExpiresIn.set(this.formatDuration(diff));
      }
    });
  }

  /**
   * Parsea la respuesta del servidor y la convierte a Date
   * @param response - Respuesta del servidor (string, número o objeto con expiresAt)
   * @returns Objeto Date
   */
  private parseDateFromResponse(response: string | number | { expiresAt?: string | number }): Date {
    if (typeof response === 'string' || typeof response === 'number') {
      return new Date(response);
    }
    if (response && typeof response === 'object' && 'expiresAt' in response) {
      const expiresAt = response.expiresAt;
      if (expiresAt) {
        return new Date(expiresAt);
      }
    }
    throw new Error('Invalid date response from server');
  }

  /**
   * Formatea milisegundos a formato mm:ss
   * @param milliseconds - Tiempo en milisegundos
   * @returns String en formato mm:ss
   */
  private formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  public submit(): void {
    this.submitted.set(true);
    if (this.codeExpiresIn()) {
      this.requestDelete();
    } else {
      this.generateCode();
    }
  }
}

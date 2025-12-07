import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';

import { GoogleTagManagerService, StorageService } from '@factor_ec/utils';
import { ProgressComponent, MessageService, IconComponent } from '@factor_ec/ui';

import { AppManager } from '@/core/services/app-manager';
import { AuthService } from '@/cross/auth/auth-service';
import { ForgotPassword } from '@/cross/auth/components/forgot-password/forgot-password';
import { environment } from '@/environments/environment';
import { ErrorMessagePipe } from '@/core/pipes/error-message-pipe';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Hosts the authentication experience, exposing sign-in and sign-up forms,
 * and orchestrating supporting flows such as password recovery and social login.
 *
 * @remarks
 * The component relies on signals for state management and delegates business logic
 * to {@link AuthService} while keeping UI rendering declarative.
 */
@Component({
  selector: 'ft-auth',
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormField,
    MatInputModule,
    MatMenuModule,
    RouterModule,
    IconComponent,
    ProgressComponent,
    ErrorMessagePipe
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-auth',
    '[class.ft-auth--form]': '!!mode()'
  }
})
export class Auth implements OnInit {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  public readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly formBuilder = inject(FormBuilder);
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private readonly title = inject(Title);

  // Properties
  public readonly errorMessage = signal<string>('');
  public readonly mode = signal<string>('');
  public readonly passwordVisible = signal<boolean>(false);
  public readonly signinForm: FormGroup;
  public readonly signupForm: FormGroup;
  public readonly submitting = signal<boolean>(false);

  constructor() {
    this.signinForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.signupForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.setMode(this.route.snapshot.data['mode']);
  }
  public async connect(client: 'google'): Promise<void> {
    this.submitting.set(true);
    this.signinForm.disable();
    this.signupForm.disable();
    const connected = await this.authService.connect(client);
    if (!connected) {
      this.submitting.set(false);
      this.signinForm.enable();
      this.signupForm.enable();
    }
  }
  public forgetUser(): void {
    this.storageService.delete(`${environment.sessionPrefix}_lus`, 'local');
    this.signinForm.patchValue({ email: '', password: '' });
  }
  public forgotPassword(): void {
    this.dialog.open(ForgotPassword, {
      panelClass: 'ft-dialog',
      width: '400px'
    });
  }
  public setMode(mode: string): void {
    this.mode.set(mode);
    switch (mode) {
      case 'signin':
        this.title.setTitle($localize`Sign in`);
        break;
      case 'signup':
        this.title.setTitle($localize`Sign up`);
        break;
      default:
        this.title.setTitle($localize`Start`);
        break;
    }
    this.googleTagManagerService.addVariable({
      event: 'page_view',
      page_title: this.title.getTitle()
    });
  }
  public async submitSignin(): Promise<void> {
    if (this.signinForm.valid) {
      this.errorMessage.set('');
      this.signinForm.disable();
      this.submitting.set(true);
      try {
        await this.authService.signin(this.signinForm.value);
        this.googleTagManagerService.addVariable({
          event: 'login',
          user_id: this.signinForm.value.username,
          app_id: this.appManager.name
        });
      } catch (err: unknown) {
        this.signinForm.enable();
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse) {
          this.errorMessage.set(
            err.error?.detail || err.error.message || err.message || $localize`Unexpected error`
          );
          this.messageService.show(this.errorMessage());
        }
      }
    }
  }
  public async submitSignup(): Promise<void> {
    if (this.signupForm.valid) {
      try {
        this.errorMessage.set('');
        this.submitting.set(true);
        this.signupForm.disable();
        await this.authService.signup(this.signupForm.value);
        this.googleTagManagerService.addVariable({
          event: 'sign_up',
          user_id: this.signupForm.value.username,
          app_id: this.appManager.name
        });
        await this.authService.signin({
          username: this.signupForm.value.email,
          password: this.signupForm.value.password
        });
        // If a redirect exists, use it; otherwise load the home page
        if (this.storageService.get(`${environment.sessionPrefix}_rdi`)) {
          this.router.navigateByUrl(this.storageService.get(`${environment.sessionPrefix}_rdi`));
          this.storageService.delete(`${environment.sessionPrefix}_rdi`);
        } else {
          this.router.navigateByUrl('/');
        }
      } catch (err: unknown) {
        this.signupForm.enable();
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse) {
          this.errorMessage.set(
            err.error?.detail || err.error.message || err.message || $localize`Unexpected error`
          );
          this.messageService.show(this.errorMessage());
        }
      }
    }
  }
  public togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

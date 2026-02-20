import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  disabled,
  email,
  form,
  FormField,
  minLength,
  required,
  submit
} from '@angular/forms/signals';
import { Title } from '@angular/platform-browser';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';

import { GoogleTagManagerService, StorageService } from '@factor_ec/utils';
import { ProgressComponent, MessageService, IconComponent } from '@factor_ec/ui';

import { AppManager } from '@/core/services/app-manager';
import { AuthProvider } from 'auth-core';
import { Session } from '@/core/services/session';
import { ForgotPassword } from '@/features/settings/components/forgot-password/forgot-password';
import { environment } from '@/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthMode, AuthSignin, AuthSignup } from '../../models/auth';

/**
 * Hosts the authentication experience, exposing sign-in and sign-up forms,
 * and orchestrating supporting flows such as password recovery and social login.
 *
 * @remarks
 * The component relies on signals for state management and delegates business logic
 * to {@link AuthService} while keeping UI rendering declarative.
 */
@Component({
  selector: 'app-auth',
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormField,
    MatButtonModule,
    MatFormField,
    MatInputModule,
    MatMenuModule,
    RouterModule,
    IconComponent,
    ProgressComponent
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-auth',
    '[class.ft-auth--form]': '!!mode()'
  }
})
export class Auth implements OnInit {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  public readonly authProvider = inject(AuthProvider);
  private readonly session = inject(Session);
  private readonly dialog = inject(MatDialog);
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private readonly title = inject(Title);

  // Properties
  public readonly allowAuthFederation = environment.auth.allowAuthFederation;
  public readonly allowSignup = environment.auth.allowSignup;
  public readonly errorMessage = signal<string>('');
  public readonly mode = signal<AuthMode | undefined>(undefined);
  public readonly passwordVisible = signal<boolean>(false);
  public readonly authSignin = signal<AuthSignin>({ username: '', password: '' });
  public readonly authSignup = signal<AuthSignup>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  public readonly signinForm = form(this.authSignin, (schemaPath) => {
    required(schemaPath.username, { message: $localize`Field required` });
    minLength(schemaPath.username, 4, { message: $localize`Type at least 4 characters` });
    required(schemaPath.password, { message: $localize`Field required` });
    minLength(schemaPath.password, 8, { message: $localize`Type at least 8 characters` });
    disabled(schemaPath.username, () => this.submitting());
    disabled(schemaPath.password, () => this.submitting());
  });
  public readonly signupForm = form(this.authSignup, (schemaPath) => {
    required(schemaPath.firstName, { message: $localize`Field required` });
    required(schemaPath.lastName, { message: $localize`Field required` });
    required(schemaPath.email, { message: $localize`Field required` });
    email(schemaPath.email, { message: $localize`Type a valid email` });
    required(schemaPath.password, { message: $localize`Field required` });
    minLength(schemaPath.password, 8, { message: $localize`Type at least 8 characters` });
    disabled(schemaPath.firstName, () => this.submitting());
    disabled(schemaPath.lastName, () => this.submitting());
    disabled(schemaPath.email, () => this.submitting());
    disabled(schemaPath.password, () => this.submitting());
  });
  public readonly submitting = signal<boolean>(false);

  ngOnInit(): void {
    this.setMode(this.route.snapshot.data['mode']);
  }
  public async connect(client: 'google'): Promise<void> {
    this.submitting.set(true);
    const connected = this.authProvider.connect ? await this.authProvider.connect(client) : false;
    if (!connected) {
      this.submitting.set(false);
    }
  }
  public forgotPassword(): void {
    this.dialog.open(ForgotPassword, {
      panelClass: 'ft-dialog',
      width: '400px'
    });
  }
  public setMode(mode: AuthMode): void {
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
  public handleSigninSubmit(event: Event): Promise<void> {
    event.preventDefault();
    return submit(this.signinForm, async () => {
      this.errorMessage.set('');
      try {
        this.submitting.set(true);
        const credentials = this.authSignin();
        await this.authProvider.login(credentials);
        const settings = await this.session.getSettings(true);
        this.googleTagManagerService.addVariable({
          event: 'login',
          user_id: credentials.username,
          app_id: environment.appId
        });
        this.submitting.set(false);
        if (settings) {
          const redirectUrl = this.storageService.get(`${environment.sessionPrefix}_rdi`);
          if (redirectUrl) {
            this.router.navigateByUrl(redirectUrl);
            this.storageService.delete(`${environment.sessionPrefix}_rdi`);
          } else {
            this.router.navigateByUrl('/');
          }
        }
      } catch (err: unknown) {
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse) {
          this.errorMessage.set(
            err.error?.detail || err.error.message || err.message || $localize`Unexpected error`
          );
          this.messageService.show(this.errorMessage());
        }
      }
    });
  }
  public handleSignupSubmit(event: Event): Promise<void> {
    event.preventDefault();
    return submit(this.signupForm, async () => {
      try {
        this.errorMessage.set('');
        this.submitting.set(true);
        const data = this.authSignup();
        await this.authProvider.signup?.({
          firstname: data.firstName,
          lastname: data.lastName,
          email: data.email,
          username: data.email,
          password: data.password
        });
        this.googleTagManagerService.addVariable({
          event: 'sign_up',
          user_id: data.email,
          app_id: environment.appId
        });
        await this.authProvider.login({
          username: data.email,
          password: data.password
        });
        this.submitting.set(false);
        if (this.storageService.get(`${environment.sessionPrefix}_rdi`)) {
          this.router.navigateByUrl(this.storageService.get(`${environment.sessionPrefix}_rdi`));
          this.storageService.delete(`${environment.sessionPrefix}_rdi`);
        } else {
          this.router.navigateByUrl('/');
        }
      } catch (err: unknown) {
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse) {
          this.errorMessage.set(
            err.error?.detail || err.error.message || err.message || $localize`Unexpected error`
          );
          this.messageService.show(this.errorMessage());
        }
      }
    });
  }
  public togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

import { Component, signal, inject, OnInit } from '@angular/core';
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

import { AppManager } from 'app/core/services/app-manager';
import { AuthService } from 'app/auth/auth-service';
import { ForgotPassword } from 'app/auth/components/forgot-password/forgot-password';
import { Page } from 'app/core/components/page/page';
import { environment } from 'environments/environment';
import { ErrorMessagePipe } from 'app/core/pipes/error-message-pipe';

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
  host: {
    class: 'ft-auth',
    '[class.ft-auth--form]': '!!mode()'
  }
})
export class Auth implements OnInit {
  public appManager = inject(AppManager);
  public authService = inject(AuthService);
  private dialog = inject(MatDialog);
  public errorMessage = signal<string>('');
  private formBuilder = inject(FormBuilder);
  private googleTagManagerService = inject(GoogleTagManagerService);
  private messageService = inject(MessageService);
  public mode = signal<string>('');
  public lastUser = signal<any>(undefined);
  public passwordVisible = signal<boolean>(false);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public signinForm: FormGroup;
  public signupForm: FormGroup;
  public submitting = signal<boolean>(false);
  private storageService = inject(StorageService);
  private title = inject(Title);

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
    this.lastUser = this.storageService.get(`${environment.sessionPrefix}_lus`, 'local');
  }

  ngOnInit(): void {
    this.setMode(this.route.snapshot.data['mode']);
    if (this.lastUser) {
      this.signinForm.patchValue({ email: this.lastUser().email });
    }
  }
  async connect(client: 'google'): Promise<void> {
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
  forgetUser(): void {
    this.storageService.delete(`${environment.sessionPrefix}_lus`, 'local');
    this.lastUser.set(undefined);
    this.signinForm.patchValue({ email: '', password: '' });
  }
  forgotPassword(): void {
    this.dialog.open(ForgotPassword, {
      panelClass: 'ft-dialog',
      width: '400px'
    });
  }
  openPage(url: string): void {
    this.dialog.open(Page, {
      data: { url },
      panelClass: ['ft-dialog', 'ft-dialog--stacked'],
      height: '100vh',
      width: '600px',
      position: {
        left: 'auto',
        right: '0'
      }
    });
  }
  setMode(mode: string): void {
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
  async submitSignin(): Promise<void> {
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
      } catch (err: any) {
        this.signinForm.enable();
        this.submitting.set(false);
        this.errorMessage.set(
          err.error?.detail || err.error.message || err.message || $localize`Unexpected error`
        );
        this.messageService.show(this.errorMessage());
      }
    }
  }
  async submitSignup(): Promise<void> {
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
      } catch (err: any) {
        this.signupForm.enable();
        this.submitting.set(false);
        this.errorMessage.set(
          err.error?.detail || err.error.message || err.message || $localize`Unexpected error`
        );
        this.messageService.show(this.errorMessage());
      }
    }
  }
  togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

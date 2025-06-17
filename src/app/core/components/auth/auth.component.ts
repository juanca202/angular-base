import {
  Component,
  HostBinding,
  signal,
  inject,
  OnInit,
  input,
  ElementRef,
  viewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';

import { GoogleTagManagerService, StorageService } from '@factor_ec/utils';
import {
  ProgressComponent,
  MessageService,
  IconComponent,
  ObserveIntersectingDirective
} from '@factor_ec/ui';

import { AppService } from 'app/core/app.service';
import { Feature } from 'app/core/models/feature';
import { AuthService } from 'app/core/auth.service';
import { ForgotPasswordComponent } from 'app/core/components/forgot-password/forgot-password.component';
import { PageComponent } from 'app/core/components/page/page.component';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-auth',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ObserveIntersectingDirective,
    MatButtonModule,
    MatFormField,
    MatInputModule,
    MatMenuModule,
    RouterModule,
    IconComponent,
    ProgressComponent
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit, AfterViewInit {
  public appService = inject(AppService);
  public authService = inject(AuthService);
  readonly class = input<string>('');
  @HostBinding('class') get hostClasses(): string {
    return [
      'ft-page--fullscreen',
      'ft-auth',
      this.mode() ? 'ft-auth--form' : null,
      this.class()
    ].join(' ');
  }
  public currentFeatureIndex = signal<number>(0);
  private dialog = inject(MatDialog);
  public errorMessage = signal<string>('');
  public features = signal<Feature[]>([
    {
      description: $localize`Take control and reach your financial goals faster.`,
      imageUrl: 'images/goal.svg',
      color: '#FF9800'
    },
    {
      description: $localize`Get smart reports and full control over your spending.`,
      imageUrl: 'images/reports.svg',
      color: '#7E4CAF'
    },
    {
      description: $localize`Build better financial habits, starting today.`,
      imageUrl: 'images/security-breach.svg',
      color: '#0094FF'
    }
  ]);
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
  private carouselDirection = 1;
  private carouselInterval!: ReturnType<typeof setInterval>;
  readonly carouselElement =
    viewChild.required<ElementRef<any>>('carouselElement');

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
    this.lastUser = this.storageService.get(
      `${environment.sessionPrefix}_lus`,
      'local'
    );
  }

  ngOnInit(): void {
    this.setMode(this.route.snapshot.data['mode']);
    if (this.lastUser) {
      this.signinForm.patchValue({ email: this.lastUser().email });
    }
  }
  ngAfterViewInit(): void {
    this.carouselInterval = setInterval(() => {
      this.scrollCarousel();
    }, 10000);
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
    this.dialog.open(ForgotPasswordComponent, {
      panelClass: 'ft-dialog',
      width: '400px'
    });
  }
  openPage(url: string): void {
    this.dialog.open(PageComponent, {
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
  scrollCarousel(): void {
    const carousel = this.carouselElement().nativeElement;
    if (
      this.carouselDirection === 1 &&
      carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth
    ) {
      this.carouselDirection = -1;
    } else if (this.carouselDirection === -1 && carousel.scrollLeft <= 0) {
      this.carouselDirection = 1;
    }
    carousel.scrollLeft += carousel.clientWidth * this.carouselDirection;
  }
  setCurrentFeatureIndex(event: boolean, index: number): void {
    if (event) {
      this.currentFeatureIndex.set(index);
    }
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
          app_id: this.appService.name
        });
      } catch (err: any) {
        this.signinForm.enable();
        this.submitting.set(false);
        this.errorMessage.set(
          err.error?.detail ||
            err.error.message ||
            err.message ||
            $localize`Unexpected error`
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
          app_id: this.appService.name
        });
        await this.authService.signin({
          username: this.signupForm.value.email,
          password: this.signupForm.value.password
        });
        // Si encuentra una redirección la usa sino carga la pagina inicial
        if (this.storageService.get(`${environment.sessionPrefix}_rdi`)) {
          this.router.navigateByUrl(
            this.storageService.get(`${environment.sessionPrefix}_rdi`)
          );
          this.storageService.delete(`${environment.sessionPrefix}_rdi`);
        } else {
          this.router.navigateByUrl('/');
        }
      } catch (err: any) {
        this.signupForm.enable();
        this.submitting.set(false);
        this.errorMessage.set(
          err.error?.detail ||
            err.error.message ||
            err.message ||
            $localize`Unexpected error`
        );
        this.messageService.show(this.errorMessage());
      }
    }
  }
  togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }
}

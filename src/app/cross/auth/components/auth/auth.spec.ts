import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Auth } from './auth';
import { AppManager } from '@/core/services/app-manager';
import { AuthService } from '@/cross/auth/auth-service';
import { GoogleTagManagerService, StorageService } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';
import {
  createMockRouter,
  createMockActivatedRoute,
  createMockStorageService,
  createMockTitle,
  COMMON_TEST_PROVIDERS
} from '@/test/mocks/angular-mocks';
import {
  createMockAppManager,
  createMockAuthService,
  createMockGoogleTagManagerService,
  createMockMessageService,
  createMockMatDialog
} from '@/test/mocks/service-mocks';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;
  let mockAppManager: Partial<AppManager>;
  let mockAuthService: Partial<AuthService>;
  let mockGoogleTagManagerService: Partial<GoogleTagManagerService>;
  let mockMessageService: Partial<MessageService>;
  let mockStorageService: Partial<StorageService>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockTitle: Title;
  let mockDialog: Partial<MatDialog>;

  beforeEach(async () => {
    // Arrange: Create mocks using factory functions
    mockAppManager = createMockAppManager();
    mockAuthService = createMockAuthService();
    mockGoogleTagManagerService = createMockGoogleTagManagerService();
    mockMessageService = createMockMessageService();
    mockStorageService = createMockStorageService();
    mockRouter = createMockRouter({ navigateByUrl: vi.fn().mockResolvedValue(true) });
    mockActivatedRoute = createMockActivatedRoute({
      snapshot: {
        data: { mode: 'signin' }
      } as any
    });
    mockTitle = createMockTitle();
    (mockTitle as any).getTitle = vi.fn().mockReturnValue('Sign in');
    mockDialog = createMockMatDialog();

    // Override component before configuring the module
    TestBed.overrideComponent(Auth, {
      remove: { templateUrl: './auth.html', styleUrl: './auth.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [Auth, ReactiveFormsModule, RouterModule],
      providers: [
        { provide: AppManager, useValue: mockAppManager },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GoogleTagManagerService, useValue: mockGoogleTagManagerService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: MatDialog, useValue: mockDialog },
        ...COMMON_TEST_PROVIDERS.getCommonProviders({
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          title: mockTitle,
          storageService: mockStorageService
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create component', () => {
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should inject dependencies', () => {
      // Arrange & Act & Assert
      expect(component.appManager).toBeDefined();
      expect(component.authService).toBeDefined();
    });

    it('should initialize signinForm with validators', () => {
      // Arrange & Act
      const form = component.signinForm;

      // Assert
      expect(form).toBeDefined();
      expect(form.get('username')?.value).toBe('');
      expect(form.get('password')?.value).toBe('');
      expect(form.get('username')?.hasError('required')).toBe(true);
      expect(form.get('password')?.hasError('required')).toBe(true);
    });

    it('should initialize signupForm with validators', () => {
      // Arrange & Act
      const form = component.signupForm;

      // Assert
      expect(form).toBeDefined();
      expect(form.get('firstName')?.value).toBe('');
      expect(form.get('lastName')?.value).toBe('');
      expect(form.get('email')?.value).toBe('');
      expect(form.get('password')?.value).toBe('');
      expect(form.get('firstName')?.hasError('required')).toBe(true);
    });

    it('should initialize signals with default values', () => {
      // Arrange & Act & Assert
      expect(component.errorMessage()).toBe('');
      expect(component.mode()).toBe('');
      expect(component.passwordVisible()).toBe(false);
      expect(component.submitting()).toBe(false);
    });

    it('should set mode from route data on init', () => {
      // Arrange & Act
      component.ngOnInit();

      // Assert
      expect(component.mode()).toBe('signin');
    });
  });

  describe('setMode', () => {
    it('should set mode and title for signin', () => {
      // Arrange & Act
      component.setMode('signin');

      // Assert
      expect(component.mode()).toBe('signin');
      expect(mockTitle.setTitle).toHaveBeenCalled();
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalled();
    });

    it('should set mode and title for signup', () => {
      // Arrange & Act
      component.setMode('signup');

      // Assert
      expect(component.mode()).toBe('signup');
      expect(mockTitle.setTitle).toHaveBeenCalled();
    });

    it('should set default title for unknown mode', () => {
      // Arrange & Act
      component.setMode('unknown');

      // Assert
      expect(component.mode()).toBe('unknown');
      expect(mockTitle.setTitle).toHaveBeenCalled();
    });
  });

  describe('connect', () => {
    it('should connect with google and disable forms', async () => {
      // Arrange
      mockAuthService.connect = vi.fn().mockResolvedValue(true);

      // Act
      await component.connect('google');

      // Assert
      expect(component.submitting()).toBe(true);
      expect(component.signinForm.disabled).toBe(true);
      expect(component.signupForm.disabled).toBe(true);
      expect(mockAuthService.connect).toHaveBeenCalledWith('google');
    });

    it('should re-enable forms if connection fails', async () => {
      // Arrange
      mockAuthService.connect = vi.fn().mockResolvedValue(false);

      // Act
      await component.connect('google');

      // Assert
      expect(component.submitting()).toBe(false);
      expect(component.signinForm.enabled).toBe(true);
      expect(component.signupForm.enabled).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should open forgot password dialog', () => {
      // Arrange & Act
      component.forgotPassword();

      // Assert
      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('submitSignin', () => {
    it('should not submit when form is invalid', async () => {
      // Arrange
      component.signinForm.get('username')?.setValue('');

      // Act
      await component.submitSignin();

      // Assert
      expect(mockAuthService.signin).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', async () => {
      // Arrange
      component.signinForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      // Act
      await component.submitSignin();

      // Assert
      expect(component.errorMessage()).toBe('');
      expect(component.submitting()).toBe(false);
      expect(mockAuthService.signin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalled();
    });

    it('should handle error on signin', async () => {
      // Arrange
      component.signinForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      const errorResponse = new HttpErrorResponse({
        error: { detail: 'Invalid credentials' },
        status: 401,
        statusText: 'Unauthorized'
      });
      mockAuthService.signin = vi.fn().mockRejectedValue(errorResponse);

      // Act
      await component.submitSignin();

      // Assert
      expect(component.errorMessage()).toBe('Invalid credentials');
      expect(component.submitting()).toBe(false);
      expect(component.signinForm.enabled).toBe(true);
      expect(mockMessageService.show).toHaveBeenCalled();
    });
  });

  describe('submitSignup', () => {
    it('should not submit when form is invalid', async () => {
      // Arrange
      component.signupForm.get('firstName')?.setValue('');

      // Act
      await component.submitSignup();

      // Assert
      expect(mockAuthService.signup).not.toHaveBeenCalled();
    });

    it('should submit and signin when form is valid', async () => {
      // Arrange
      component.signupForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });

      // Act
      await component.submitSignup();

      // Assert
      expect(component.errorMessage()).toBe('');
      expect(mockAuthService.signup).toHaveBeenCalled();
      expect(mockAuthService.signin).toHaveBeenCalled();
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalled();
    });

    it('should navigate to redirect URL if exists', async () => {
      // Arrange
      component.signupForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });
      mockStorageService.get = vi.fn().mockReturnValue('/dashboard');

      // Act
      await component.submitSignup();

      // Assert
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
      expect(mockStorageService.delete).toHaveBeenCalledWith(`${environment.sessionPrefix}_rdi`);
    });

    it('should navigate to home if no redirect URL', async () => {
      // Arrange
      component.signupForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });
      mockStorageService.get = vi.fn().mockReturnValue(null);

      // Act
      await component.submitSignup();

      // Assert
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should handle error on signup', async () => {
      // Arrange
      component.signupForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });
      const errorResponse = new HttpErrorResponse({
        error: { detail: 'Email already exists' },
        status: 400,
        statusText: 'Bad Request'
      });
      mockAuthService.signup = vi.fn().mockRejectedValue(errorResponse);

      // Act
      await component.submitSignup();

      // Assert
      expect(component.errorMessage()).toBe('Email already exists');
      expect(component.submitting()).toBe(false);
      expect(component.signupForm.enabled).toBe(true);
      expect(mockMessageService.show).toHaveBeenCalled();
    });
  });

  describe('togglePasswordVisible', () => {
    it('should toggle passwordVisible from false to true', () => {
      // Arrange
      expect(component.passwordVisible()).toBe(false);

      // Act
      component.togglePasswordVisible();

      // Assert
      expect(component.passwordVisible()).toBe(true);
    });

    it('should toggle passwordVisible from true to false', () => {
      // Arrange
      component.passwordVisible.set(true);

      // Act
      component.togglePasswordVisible();

      // Assert
      expect(component.passwordVisible()).toBe(false);
    });
  });
});

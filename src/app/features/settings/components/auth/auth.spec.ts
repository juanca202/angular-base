import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Auth } from './auth';
import { AppManager } from '@/core/services/app-manager';
import { Session } from '@/core/services/session';
import { AuthService, GoogleTagManager, Storage } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';
import {
  createMockRouter,
  createMockActivatedRoute,
  createMockStorageService,
  COMMON_TEST_PROVIDERS
} from '@/test/mocks/angular-mocks';
import {
  createMockAppManager,
  createMockAuthService,
  createMockGoogleTagManagerService,
  createMockMessageService,
  createMockMatDialog,
  createMockSession
} from '@/test/mocks/service-mocks';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;
  let mockAppManager: Partial<AppManager>;
  let mockAuthService: Partial<AuthService>;
  let mockGoogleTagManagerService: Partial<GoogleTagManager>;
  let mockMessageService: Partial<MessageService>;
  let mockStorageService: Partial<Storage>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockDialog: Partial<MatDialog>;
  let mockSession: Partial<Session>;

  beforeEach(async () => {
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
    mockDialog = createMockMatDialog();
    mockSession = createMockSession({ getSettings: vi.fn().mockResolvedValue(null) });

    TestBed.overrideComponent(Auth, {
      remove: { templateUrl: './auth.html', styleUrl: './auth.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [Auth, RouterModule],
      providers: [
        { provide: AppManager, useValue: mockAppManager },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GoogleTagManager, useValue: mockGoogleTagManagerService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Session, useValue: mockSession },
        ...COMMON_TEST_PROVIDERS.getCommonProviders({
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
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
      expect(component).toBeTruthy();
    });

    it('should inject dependencies', () => {
      expect(component.appManager).toBeDefined();
      expect(component.authProvider).toBeDefined();
    });

    it('should initialize signinForm with validators', () => {
      const model = component.authSignin();
      expect(component.signinForm).toBeDefined();
      expect(model.username).toBe('');
      expect(model.password).toBe('');
      expect(component.signinForm.username().invalid()).toBe(true);
      expect(component.signinForm.password().invalid()).toBe(true);
    });

    it('should initialize signupForm with validators', () => {
      const model = component.authSignup();
      expect(component.signupForm).toBeDefined();
      expect(model.firstName).toBe('');
      expect(model.lastName).toBe('');
      expect(model.email).toBe('');
      expect(model.password).toBe('');
      expect(component.signupForm.firstName().invalid()).toBe(true);
    });

    it('should initialize signals with default values', () => {
      expect(component.errorMessage()).toBe('');
      expect(component.passwordVisible()).toBe(false);
      expect(component.submitting()).toBe(false);
    });

    it('should set mode from route data on init', () => {
      component.ngOnInit();
      expect(component.mode()).toBe('signin');
    });
  });

  describe('setMode', () => {
    it('should set mode and track page view for signin', () => {
      component.setMode('signin');
      expect(component.mode()).toBe('signin');
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'page_view',
        page_title: 'Sign in'
      });
    });

    it('should set mode and track page view for signup', () => {
      component.setMode('signup');
      expect(component.mode()).toBe('signup');
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'page_view',
        page_title: 'Sign up'
      });
    });

    it('should set default page title for unknown mode', () => {
      component.setMode('unknown' as any);
      expect(component.mode()).toBe('unknown');
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'page_view',
        page_title: 'Start'
      });
    });
  });

  describe('connect', () => {
    it('should connect with google and set submitting', async () => {
      mockAuthService.connect = vi.fn().mockResolvedValue(true);
      await component.connect('google');
      expect(component.submitting()).toBe(true);
      expect(mockAuthService.connect).toHaveBeenCalledWith('google');
    });

    it('should reset submitting if connection fails', async () => {
      mockAuthService.connect = vi.fn().mockResolvedValue(false);
      await component.connect('google');
      expect(component.submitting()).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('should open forgot password dialog', () => {
      component.forgotPassword();
      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('handleSigninSubmit', () => {
    it('should not submit when form is invalid', async () => {
      component.authSignin.set({ username: '', password: '' });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.handleSigninSubmit(event);
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', async () => {
      component.authSignin.set({
        username: 'testuser',
        password: 'password123'
      });
      mockAuthService.login = vi.fn().mockResolvedValue(true);
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.handleSigninSubmit(event);
      expect(component.errorMessage()).toBe('');
      expect(component.submitting()).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalled();
    });

    it('should handle error on signin', async () => {
      component.authSignin.set({
        username: 'testuser',
        password: 'password123'
      });
      const errorResponse = new HttpErrorResponse({
        error: { detail: 'Invalid credentials' },
        status: 401,
        statusText: 'Unauthorized'
      });
      mockAuthService.login = vi.fn().mockRejectedValue(errorResponse);
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.handleSigninSubmit(event);
      expect(component.errorMessage()).toBe('Invalid credentials');
      expect(component.submitting()).toBe(false);
      expect(mockMessageService.show).toHaveBeenCalled();
    });
  });

  describe('handleSignupSubmit', () => {
    it('should not submit when form is invalid', async () => {
      component.authSignup.set({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.handleSignupSubmit(event);
      expect(mockAuthService.signup).not.toHaveBeenCalled();
    });

    it('should submit and signin when form is valid', async () => {
      component.authSignup.set({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });
      mockAuthService.signup = vi.fn().mockResolvedValue(undefined);
      mockAuthService.login = vi.fn().mockResolvedValue(true);
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.handleSignupSubmit(event);
      expect(component.errorMessage()).toBe('');
      expect(mockAuthService.signup).toHaveBeenCalled();
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalled();
    });

    it('should navigate to redirect URL if exists', async () => {
      component.authSignup.set({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });
      mockAuthService.signup = vi.fn().mockResolvedValue(undefined);
      mockAuthService.login = vi.fn().mockResolvedValue(true);
      mockStorageService.get = vi.fn().mockReturnValue('/dashboard');
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.handleSignupSubmit(event);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
      expect(mockStorageService.delete).toHaveBeenCalledWith(`${environment.sessionPrefix}_rdi`);
    });

    it('should navigate to home if no redirect URL', async () => {
      component.authSignup.set({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });
      mockAuthService.signup = vi.fn().mockResolvedValue(undefined);
      mockAuthService.login = vi.fn().mockResolvedValue(true);
      mockStorageService.get = vi.fn().mockReturnValue(null);
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.handleSignupSubmit(event);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should handle error on signup', async () => {
      component.authSignup.set({
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
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.handleSignupSubmit(event);
      expect(component.errorMessage()).toBe('Email already exists');
      expect(component.submitting()).toBe(false);
      expect(mockMessageService.show).toHaveBeenCalled();
    });
  });

  describe('togglePasswordVisible', () => {
    it('should toggle passwordVisible from false to true', () => {
      expect(component.passwordVisible()).toBe(false);
      component.togglePasswordVisible();
      expect(component.passwordVisible()).toBe(true);
    });

    it('should toggle passwordVisible from true to false', () => {
      component.passwordVisible.set(true);
      component.togglePasswordVisible();
      expect(component.passwordVisible()).toBe(false);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ResetPassword } from './reset-password';
import { AppManager } from '@/core/services/app-manager';
import { MessageService } from '@factor_ec/ui';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { of } from 'rxjs';

// Inicializar el entorno de pruebas de Angular si no está inicializado
if (!getTestBed().platform) {
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
}

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  let mockAppManager: Partial<AppManager>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockTitle: Title;
  let mockMessageService: Partial<MessageService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // Arrange: Create mocks
    mockAppManager = {};

    mockRouter = {
      navigateByUrl: vi.fn().mockResolvedValue(true)
    };

    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: vi.fn().mockReturnValue('test-token')
        }
      } as any
    };

    mockTitle = {
      setTitle: vi.fn()
    } as any;

    mockMessageService = {
      show: vi.fn().mockReturnValue(of(undefined))
    };

    // Override component before configuring the module
    TestBed.overrideComponent(ResetPassword, {
      remove: { templateUrl: './reset-password.html', styleUrl: './reset-password.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [ResetPassword, ReactiveFormsModule, MatDialogModule, HttpClientTestingModule],
      providers: [
        { provide: AppManager, useValue: mockAppManager },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Title, useValue: mockTitle },
        { provide: MessageService, useValue: mockMessageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('initialization', () => {
    it('should create component', () => {
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should inject dependencies', () => {
      // Arrange & Act & Assert
      expect(component.appManager).toBeDefined();
    });

    it('should initialize form with token from query params', () => {
      // Arrange & Act
      const form = component.form;

      // Assert
      expect(form).toBeDefined();
      expect(form.get('token')?.value).toBe('test-token');
      expect(form.get('password')?.value).toBe('');
      expect(form.get('confirmPassword')?.value).toBe('');
    });

    it('should have form validators', () => {
      // Arrange & Act
      const form = component.form;

      // Assert
      expect(form.get('password')?.hasError('required')).toBe(true);
      expect(form.get('confirmPassword')?.hasError('required')).toBe(true);
    });

    it('should set page title on construction', () => {
      // Arrange & Act & Assert
      expect(mockTitle.setTitle).toHaveBeenCalled();
    });

    it('should initialize signals with default values', () => {
      // Arrange & Act & Assert
      expect(component.submitting()).toBe(false);
      expect(component.passwordVisible()).toBe(false);
    });
  });

  describe('confirmPasswordValidator', () => {
    it('should validate when passwords match', () => {
      // Arrange
      const form = component.form;
      form.get('password')?.setValue('NewPassword123!');
      form.get('confirmPassword')?.setValue('NewPassword123!');

      // Act
      const confirmPasswordControl = form.get('confirmPassword');

      // Assert
      expect(confirmPasswordControl?.valid).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      // Arrange
      const form = component.form;
      form.get('password')?.setValue('NewPassword123!');
      form.get('confirmPassword')?.setValue('DifferentPassword123!');

      // Act
      const confirmPasswordControl = form.get('confirmPassword');

      // Assert
      expect(confirmPasswordControl?.hasError('notEqual')).toBe(true);
    });
  });

  describe('submit', () => {
    it('should not submit when form is invalid', async () => {
      // Arrange
      component.form.get('password')?.setValue('');

      // Act
      await component.submit();

      // Assert
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockMessageService.show).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', async () => {
      // Arrange
      component.form.patchValue({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

      // Act
      const submitPromise = component.submit();
      expect(component.submitting()).toBe(true);
      expect(component.form.disabled).toBe(true);

      const req = httpMock.expectOne(environment.auth.resetPasswordUrl);
      expect(req.request.method).toBe('POST');
      req.flush({});

      await submitPromise;

      // Assert
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
      expect(component.submitting()).toBe(false);
      expect(component.form.enabled).toBe(true);
    });

    it('should show success message after successful submit', async () => {
      // Arrange
      vi.useFakeTimers();
      component.form.patchValue({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

      // Act
      const submitPromise = component.submit();

      const req = httpMock.expectOne(environment.auth.resetPasswordUrl);
      req.flush({});

      await submitPromise;

      vi.advanceTimersByTime(100);

      // Assert
      expect(mockMessageService.show).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should handle error on submit', async () => {
      // Arrange
      component.form.patchValue({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error' },
        status: 400,
        statusText: 'Bad Request'
      });

      // Act
      const submitPromise = component.submit();

      const req = httpMock.expectOne(environment.auth.resetPasswordUrl);
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      // Assert
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(component.submitting()).toBe(false);
      expect(component.form.enabled).toBe(true);
      expect(mockMessageService.show).toHaveBeenCalled();
    });

    it('should handle HttpErrorResponse with detail', async () => {
      // Arrange
      component.form.patchValue({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const errorResponse = new HttpErrorResponse({
        error: { detail: 'Invalid token' },
        status: 400,
        statusText: 'Bad Request'
      });

      // Act
      const submitPromise = component.submit();

      const req = httpMock.expectOne(environment.auth.resetPasswordUrl);
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      // Assert
      expect(mockMessageService.show).toHaveBeenCalledWith('Invalid token', { type: 'modal' });
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

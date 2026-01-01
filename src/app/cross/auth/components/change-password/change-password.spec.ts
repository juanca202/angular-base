import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ChangePassword } from './change-password';
import { AppManager } from '@/core/services/app-manager';
import { MessageService } from '@factor_ec/ui';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiUrl } from '@/core/utils/async-repository';
import {
  createMockAppManager,
  createMockMessageService,
  createMockMatDialogRef
} from '@/test/mocks/service-mocks';

describe('ChangePassword', () => {
  let component: ChangePassword;
  let fixture: ComponentFixture<ChangePassword>;
  let mockAppManager: Partial<AppManager>;
  let mockDialogRef: Partial<MatDialogRef<ChangePassword>>;
  let mockMessageService: Partial<MessageService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // Arrange: Create mocks
    mockAppManager = createMockAppManager();
    mockDialogRef = createMockMatDialogRef<ChangePassword>();
    mockMessageService = createMockMessageService();

    // Override component before configuring the module
    TestBed.overrideComponent(ChangePassword, {
      remove: { templateUrl: './change-password.html', styleUrl: './change-password.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [ChangePassword, ReactiveFormsModule, MatDialogModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppManager, useValue: mockAppManager },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MessageService, useValue: mockMessageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePassword);
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

    it('should initialize form with empty values', () => {
      // Arrange & Act
      const form = component.form;

      // Assert
      expect(form).toBeDefined();
      expect(form.get('password')?.value).toBe('');
      expect(form.get('newPassword')?.value).toBe('');
      expect(form.get('confirmPassword')?.value).toBe('');
    });

    it('should have form validators', () => {
      // Arrange & Act
      const form = component.form;

      // Assert
      expect(form.get('password')?.hasError('required')).toBe(true);
      expect(form.get('newPassword')?.hasError('required')).toBe(true);
      expect(form.get('confirmPassword')?.hasError('required')).toBe(true);
    });

    it('should initialize signals with default values', () => {
      // Arrange & Act & Assert
      expect(component.newPasswordVisible()).toBe(false);
      expect(component.passwordVisible()).toBe(false);
      expect(component.submitting()).toBe(false);
    });
  });

  describe('passwordValidator', () => {
    it('should validate password with all requirements', () => {
      // Arrange
      const form = component.form;
      const newPasswordControl = form.get('newPassword');

      // Act
      newPasswordControl?.setValue('ValidPass123!');

      // Assert
      expect(newPasswordControl?.valid).toBe(true);
    });

    it('should reject password without minimum length', () => {
      // Arrange
      const form = component.form;
      const newPasswordControl = form.get('newPassword');

      // Act
      newPasswordControl?.setValue('Short1!');

      // Assert
      expect(newPasswordControl?.hasError('minLength')).toBe(true);
    });

    it('should reject password without uppercase', () => {
      // Arrange
      const form = component.form;
      const newPasswordControl = form.get('newPassword');

      // Act
      newPasswordControl?.setValue('validpass123!');

      // Assert
      expect(newPasswordControl?.hasError('upperCase')).toBe(true);
    });

    it('should reject password without lowercase', () => {
      // Arrange
      const form = component.form;
      const newPasswordControl = form.get('newPassword');

      // Act
      newPasswordControl?.setValue('VALIDPASS123!');

      // Assert
      expect(newPasswordControl?.hasError('lowerCase')).toBe(true);
    });

    it('should reject password without special character', () => {
      // Arrange
      const form = component.form;
      const newPasswordControl = form.get('newPassword');

      // Act
      newPasswordControl?.setValue('ValidPass123');

      // Assert
      expect(newPasswordControl?.hasError('specialCharacter')).toBe(true);
    });

    it('should reject password without number', () => {
      // Arrange
      const form = component.form;
      const newPasswordControl = form.get('newPassword');

      // Act
      newPasswordControl?.setValue('ValidPass!');

      // Assert
      expect(newPasswordControl?.hasError('number')).toBe(true);
    });
  });

  describe('confirmPasswordValidator', () => {
    it('should validate when passwords match', () => {
      // Arrange
      const form = component.form;
      form.get('newPassword')?.setValue('ValidPass123!');
      form.get('confirmPassword')?.setValue('ValidPass123!');

      // Act
      const confirmPasswordControl = form.get('confirmPassword');

      // Assert
      expect(confirmPasswordControl?.valid).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      // Arrange
      const form = component.form;
      form.get('newPassword')?.setValue('ValidPass123!');
      form.get('confirmPassword')?.setValue('DifferentPass123!');

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
      expect(mockDialogRef.close).not.toHaveBeenCalled();
      expect(mockMessageService.show).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', async () => {
      // Arrange
      component.form.patchValue({
        password: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

      // Act
      const submitPromise = component.submit();
      expect(component.submitting()).toBe(true);
      expect(component.form.disabled).toBe(true);

      const req = httpMock.expectOne(getApiUrl('change-password'));
      expect(req.request.method).toBe('POST');
      req.flush({});

      await submitPromise;

      // Assert
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(component.submitting()).toBe(false);
      expect(component.form.enabled).toBe(true);
    });

    it('should handle error on submit', async () => {
      // Arrange
      component.form.patchValue({
        password: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error' },
        status: 400,
        statusText: 'Bad Request'
      });

      // Act
      const submitPromise = component.submit();

      const req = httpMock.expectOne(getApiUrl('change-password'));
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      // Assert
      expect(mockDialogRef.close).not.toHaveBeenCalled();
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(component.submitting()).toBe(false);
      expect(component.form.enabled).toBe(true);
    });

    it('should handle HttpErrorResponse with detail', async () => {
      // Arrange
      component.form.patchValue({
        password: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const errorResponse = new HttpErrorResponse({
        error: { detail: 'Invalid password' },
        status: 400,
        statusText: 'Bad Request'
      });

      // Act
      const submitPromise = component.submit();

      const req = httpMock.expectOne(getApiUrl('change-password'));
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      // Assert
      expect(mockMessageService.show).toHaveBeenCalledWith('Invalid password', { type: 'modal' });
    });
  });

  describe('toggleNewPasswordVisible', () => {
    it('should toggle newPasswordVisible from false to true', () => {
      // Arrange
      expect(component.newPasswordVisible()).toBe(false);

      // Act
      component.toggleNewPasswordVisible();

      // Assert
      expect(component.newPasswordVisible()).toBe(true);
    });

    it('should toggle newPasswordVisible from true to false', () => {
      // Arrange
      component.newPasswordVisible.set(true);

      // Act
      component.toggleNewPasswordVisible();

      // Assert
      expect(component.newPasswordVisible()).toBe(false);
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

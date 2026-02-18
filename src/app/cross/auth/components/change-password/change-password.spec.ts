import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ChangePassword } from './change-password';
import { AppManager } from '@/core/services/app-manager';
import { MessageService } from '@factor_ec/ui';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiUrl } from '@/core/utils/async-resources';
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
    mockAppManager = createMockAppManager();
    mockDialogRef = createMockMatDialogRef<ChangePassword>();
    mockMessageService = createMockMessageService();

    TestBed.overrideComponent(ChangePassword, {
      remove: { templateUrl: './change-password.html', styleUrl: './change-password.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [ChangePassword, MatDialogModule],
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
      expect(component).toBeTruthy();
    });

    it('should inject dependencies', () => {
      expect(component.appManager).toBeDefined();
    });

    it('should initialize form with empty values', () => {
      const model = component.changeModel();
      expect(component.changeForm).toBeDefined();
      expect(model.password).toBe('');
      expect(model.newPassword).toBe('');
      expect(model.confirmPassword).toBe('');
    });

    it('should have form validators', () => {
      expect(component.changeForm.password().invalid()).toBe(true);
      expect(component.changeForm.newPassword().invalid()).toBe(true);
      expect(component.changeForm.confirmPassword().invalid()).toBe(true);
    });

    it('should initialize signals with default values', () => {
      expect(component.newPasswordVisible()).toBe(false);
      expect(component.passwordVisible()).toBe(false);
      expect(component.submitting()).toBe(false);
    });
  });

  describe('passwordValidator', () => {
    it('should validate password with all requirements', () => {
      component.changeModel.update((m) => ({ ...m, newPassword: 'ValidPass123!' }));
      expect(component.changeForm.newPassword().valid()).toBe(true);
    });

    it('should reject password without minimum length', () => {
      component.changeModel.update((m) => ({ ...m, newPassword: 'Short1!' }));
      expect(component.hasNewPasswordError('minLength')).toBe(true);
    });

    it('should reject password without uppercase', () => {
      component.changeModel.update((m) => ({ ...m, newPassword: 'validpass123!' }));
      expect(component.hasNewPasswordError('upperCase')).toBe(true);
    });

    it('should reject password without lowercase', () => {
      component.changeModel.update((m) => ({ ...m, newPassword: 'VALIDPASS123!' }));
      expect(component.hasNewPasswordError('lowerCase')).toBe(true);
    });

    it('should reject password without special character', () => {
      component.changeModel.update((m) => ({ ...m, newPassword: 'ValidPass123' }));
      expect(component.hasNewPasswordError('specialCharacter')).toBe(true);
    });

    it('should reject password without number', () => {
      component.changeModel.update((m) => ({ ...m, newPassword: 'ValidPass!' }));
      expect(component.hasNewPasswordError('number')).toBe(true);
    });
  });

  describe('confirmPasswordValidator', () => {
    it('should validate when passwords match', () => {
      component.changeModel.set({
        password: 'OldPass123!',
        newPassword: 'ValidPass123!',
        confirmPassword: 'ValidPass123!'
      });
      expect(component.changeForm.confirmPassword().valid()).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      component.changeModel.set({
        password: 'OldPass123!',
        newPassword: 'ValidPass123!',
        confirmPassword: 'DifferentPass123!'
      });
      const errors = component.changeForm.confirmPassword().errors();
      expect(errors.some((e) => e.kind === 'notEqual')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', async () => {
      component.changeModel.update((m) => ({ ...m, password: '' }));
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.onSubmit(event);
      expect(mockDialogRef.close).not.toHaveBeenCalled();
      expect(mockMessageService.show).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', async () => {
      component.changeModel.set({
        password: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(getApiUrl('change-password'));
      expect(req.request.method).toBe('POST');
      req.flush({});

      await submitPromise;

      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(component.submitting()).toBe(false);
    });

    it('should handle error on submit', async () => {
      component.changeModel.set({
        password: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error' },
        status: 400,
        statusText: 'Bad Request'
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(getApiUrl('change-password'));
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      expect(mockDialogRef.close).not.toHaveBeenCalled();
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(component.submitting()).toBe(false);
    });

    it('should handle HttpErrorResponse with detail', async () => {
      component.changeModel.set({
        password: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const errorResponse = new HttpErrorResponse({
        error: { detail: 'Invalid password' },
        status: 400,
        statusText: 'Bad Request'
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(getApiUrl('change-password'));
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      expect(mockMessageService.show).toHaveBeenCalledWith('Invalid password', { type: 'modal' });
    });
  });

  describe('toggleNewPasswordVisible', () => {
    it('should toggle newPasswordVisible from false to true', () => {
      expect(component.newPasswordVisible()).toBe(false);
      component.toggleNewPasswordVisible();
      expect(component.newPasswordVisible()).toBe(true);
    });

    it('should toggle newPasswordVisible from true to false', () => {
      component.newPasswordVisible.set(true);
      component.toggleNewPasswordVisible();
      expect(component.newPasswordVisible()).toBe(false);
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

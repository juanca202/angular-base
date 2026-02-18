import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPassword } from './reset-password';
import { AppManager } from '@/core/services/app-manager';
import { MessageService } from '@factor_ec/ui';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { of } from 'rxjs';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  let mockAppManager: Partial<AppManager>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockMessageService: Partial<MessageService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    mockAppManager = {};
    mockRouter = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: vi.fn().mockReturnValue('test-token')
        }
      } as any
    };
    mockMessageService = {
      show: vi.fn().mockReturnValue(of(undefined))
    };

    TestBed.overrideComponent(ResetPassword, {
      remove: { templateUrl: './reset-password.html', styleUrl: './reset-password.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [ResetPassword, MatDialogModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppManager, useValue: mockAppManager },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MessageService, useValue: mockMessageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    component.ngOnInit();
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

    it('should initialize form with token from query params', () => {
      const model = component.resetModel();
      expect(component.resetForm).toBeDefined();
      expect(model.token).toBe('test-token');
      expect(model.password).toBe('');
      expect(model.confirmPassword).toBe('');
    });

    it('should have form validators', () => {
      expect(component.resetForm.password().invalid()).toBe(true);
      expect(component.resetForm.confirmPassword().invalid()).toBe(true);
    });

    it('should initialize signals with default values', () => {
      expect(component.submitting()).toBe(false);
      expect(component.passwordVisible()).toBe(false);
    });
  });

  describe('confirmPassword validation', () => {
    it('should validate when passwords match', () => {
      component.resetModel.set({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      expect(component.resetForm.confirmPassword().valid()).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      component.resetModel.set({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!'
      });
      const errors = component.resetForm.confirmPassword().errors();
      expect(errors.some((e) => e.kind === 'notEqual')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', async () => {
      component.resetModel.update((m) => ({ ...m, password: '' }));
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.onSubmit(event);
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockMessageService.show).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', async () => {
      component.resetModel.set({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(environment.auth.resetPasswordUrl);
      expect(req.request.method).toBe('POST');
      req.flush({});

      await submitPromise;

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
      expect(component.submitting()).toBe(false);
    });

    it('should show success message after successful submit', async () => {
      vi.useFakeTimers();
      component.resetModel.set({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(environment.auth.resetPasswordUrl);
      req.flush({});

      await submitPromise;
      vi.advanceTimersByTime(100);

      expect(mockMessageService.show).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should handle error on submit', async () => {
      component.resetModel.set({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error' },
        status: 400,
        statusText: 'Bad Request'
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(environment.auth.resetPasswordUrl);
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(component.submitting()).toBe(false);
      expect(mockMessageService.show).toHaveBeenCalled();
    });

    it('should handle HttpErrorResponse with detail', async () => {
      component.resetModel.set({
        token: 'test-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      const errorResponse = new HttpErrorResponse({
        error: { detail: 'Invalid token' },
        status: 400,
        statusText: 'Bad Request'
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(environment.auth.resetPasswordUrl);
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      expect(mockMessageService.show).toHaveBeenCalledWith('Invalid token', { type: 'modal' });
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

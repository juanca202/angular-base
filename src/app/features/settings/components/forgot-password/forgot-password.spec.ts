import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ForgotPassword } from './forgot-password';
import { MessageService } from '@factor_ec/ui';
import { GoogleTagManager } from '@factor_ec/utils';
import { environment } from '@/environments/environment';
import {
  createMockGoogleTagManagerService,
  createMockMessageService
} from '@/test/mocks/service-mocks';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;
  let mockDialogRef: Partial<MatDialogRef<ForgotPassword>>;
  let mockMessageService: Partial<MessageService>;
  let mockGoogleTagManagerService: Partial<GoogleTagManager>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    mockMessageService = createMockMessageService();
    mockGoogleTagManagerService = createMockGoogleTagManagerService();

    TestBed.overrideComponent(ForgotPassword, {
      remove: { templateUrl: './forgot-password.html', styleUrl: './forgot-password.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [ForgotPassword, MatDialogModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MessageService, useValue: mockMessageService },
        { provide: GoogleTagManager, useValue: mockGoogleTagManagerService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
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

    it('should initialize form with empty email', () => {
      const model = component.forgotModel();
      expect(component.forgotForm).toBeDefined();
      expect(model.email).toBe('');
    });

    it('should have form validators', () => {
      expect(component.forgotForm.email().invalid()).toBe(true);
    });

    it('should initialize submitting signal with false', () => {
      expect(component.submitting()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', async () => {
      component.forgotModel.set({ email: '' });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.onSubmit(event);
      expect(component.submitting()).toBe(false);
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should not submit when email is invalid', async () => {
      component.forgotModel.set({ email: 'invalid-email' });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      await component.onSubmit(event);
      expect(component.submitting()).toBe(false);
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', async () => {
      component.forgotModel.set({ email: 'test@example.com' });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(environment.auth.forgotPasswordUrl);
      expect(req.request.method).toBe('POST');
      req.flush({});

      await submitPromise;

      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'forgot_password'
      });
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(component.submitting()).toBe(false);
    });

    it('should handle error on submit', async () => {
      component.forgotModel.set({ email: 'test@example.com' });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(environment.auth.forgotPasswordUrl);
      req.error(new ErrorEvent('Error'), { status: 400, statusText: 'Bad Request' });

      await submitPromise;

      expect(component.submitting()).toBe(false);
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should handle error with detail message', async () => {
      component.forgotModel.set({ email: 'test@example.com' });
      const errorDetail = 'Email not found';
      const errorResponse = new HttpErrorResponse({
        error: { detail: errorDetail },
        status: 400,
        statusText: 'Bad Request'
      });
      const event = { preventDefault: vi.fn() } as unknown as Event;
      const submitPromise = component.onSubmit(event);

      const req = httpMock.expectOne(environment.auth.forgotPasswordUrl);
      req.error(errorResponse.error, errorResponse);

      await submitPromise;

      expect(mockMessageService.show).toHaveBeenCalledWith(errorDetail, { type: 'modal' });
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ForgotPassword } from './forgot-password';
import { MessageService } from '@factor_ec/ui';
import { GoogleTagManagerService } from '@factor_ec/utils';
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
  let mockGoogleTagManagerService: Partial<GoogleTagManagerService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // Arrange: Create mocks
    mockDialogRef = {
      close: vi.fn()
    };

    mockMessageService = createMockMessageService();
    mockGoogleTagManagerService = createMockGoogleTagManagerService();

    // Override component before configuring the module
    TestBed.overrideComponent(ForgotPassword, {
      remove: { templateUrl: './forgot-password.html', styleUrl: './forgot-password.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [ForgotPassword, ReactiveFormsModule, MatDialogModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MessageService, useValue: mockMessageService },
        { provide: GoogleTagManagerService, useValue: mockGoogleTagManagerService }
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
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty email', () => {
      // Arrange & Act
      const form = component.form;

      // Assert
      expect(form).toBeDefined();
      expect(form.get('email')?.value).toBe('');
    });

    it('should have form validators', () => {
      // Arrange & Act
      const form = component.form;

      // Assert
      expect(form.get('email')?.hasError('required')).toBe(true);
    });

    it('should initialize submitting signal with false', () => {
      // Arrange & Act & Assert
      expect(component.submitting()).toBe(false);
    });
  });

  describe('submit', () => {
    it('should not submit when form is invalid', () => {
      // Arrange
      component.form.get('email')?.setValue('');

      // Act
      component.submit();

      // Assert
      expect(component.submitting()).toBe(false);
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should not submit when email is invalid', () => {
      // Arrange
      component.form.get('email')?.setValue('invalid-email');

      // Act
      component.submit();

      // Assert
      expect(component.submitting()).toBe(false);
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', () => {
      // Arrange
      component.form.patchValue({
        email: 'test@example.com'
      });

      // Act
      component.submit();
      expect(component.submitting()).toBe(true);
      expect(component.form.disabled).toBe(true);

      const req = httpMock.expectOne(environment.auth.forgotPasswordUrl);
      expect(req.request.method).toBe('POST');
      req.flush({});

      // Assert
      expect(mockGoogleTagManagerService.addVariable).toHaveBeenCalledWith({
        event: 'forgot_password'
      });
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(component.submitting()).toBe(false);
    });

    it('should handle error on submit', () => {
      // Arrange
      component.form.patchValue({
        email: 'test@example.com'
      });

      // Act
      component.submit();

      const req = httpMock.expectOne(environment.auth.forgotPasswordUrl);
      req.error(new ErrorEvent('Error'), { status: 400, statusText: 'Bad Request' });

      // Assert
      expect(component.submitting()).toBe(false);
      expect(component.form.enabled).toBe(true);
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should handle error with detail message', () => {
      // Arrange
      component.form.patchValue({
        email: 'test@example.com'
      });
      const errorDetail = 'Email not found';
      const errorResponse = new HttpErrorResponse({
        error: { detail: errorDetail },
        status: 400,
        statusText: 'Bad Request'
      });

      // Act
      component.submit();

      const req = httpMock.expectOne(environment.auth.forgotPasswordUrl);
      req.error(errorResponse.error, errorResponse);

      // Assert
      expect(mockMessageService.show).toHaveBeenCalledWith(errorDetail, { type: 'modal' });
    });
  });
});

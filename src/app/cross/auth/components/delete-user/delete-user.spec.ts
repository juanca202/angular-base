import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DeleteUser } from './delete-user';
import { AppManager } from '@/core/services/app-manager';
import { AuthService } from '@/cross/auth/auth-service';
import { Session } from '@/core/services/session';
import { StorageService } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { User } from '@/core/models/user';
import moment from 'moment';
import { getApiUrl } from '@/core/utils/async-resources';
import {
  createMockAppManager,
  createMockAuthService,
  createMockMessageService,
  createMockSession
} from '@/test/mocks/service-mocks';
import { createMockStorageService } from '@/test/mocks/angular-mocks';
import { of } from 'rxjs';

describe('DeleteUser', () => {
  let component: DeleteUser;
  let fixture: ComponentFixture<DeleteUser>;
  let mockAppManager: Partial<AppManager>;
  let mockAuthService: Partial<AuthService>;
  let mockSession: Partial<Session>;
  let mockStorageService: Partial<StorageService>;
  let mockMessageService: Partial<MessageService>;
  let httpMock: HttpTestingController;
  let mockUser: User;

  beforeEach(async () => {
    // Arrange: Create mocks
    mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'],
      firstName: 'Test',
      lastName: 'User',
      picture: 'https://example.com/picture.jpg'
    };

    mockAppManager = {};

    mockAuthService = {
      logout: vi.fn()
    };

    mockSession = {
      user: computed(() => mockUser)
    };

    mockStorageService = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      delete: vi.fn()
    };

    mockMessageService = {
      show: vi.fn().mockReturnValue(of(undefined))
    };

    // Override component before configuring the module
    TestBed.overrideComponent(DeleteUser, {
      remove: { templateUrl: './delete-user.html', styleUrl: './delete-user.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [DeleteUser, ReactiveFormsModule, MatDialogModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppManager, useValue: mockAppManager },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Session, useValue: mockSession },
        { provide: StorageService, useValue: mockStorageService },
        { provide: MessageService, useValue: mockMessageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteUser);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    component.ngOnDestroy();
    vi.clearAllTimers();
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
      expect(component.session).toBeDefined();
    });

    it('should initialize step1Form with email validator', () => {
      // Arrange & Act
      const form = component.step1Form;

      // Assert
      expect(form).toBeDefined();
      expect(form.get('email')?.value).toBe('');
      expect(form.get('email')?.hasError('required')).toBe(true);
    });

    it('should initialize step2Form with code validator', () => {
      // Arrange & Act
      const form = component.step2Form;

      // Assert
      expect(form).toBeDefined();
      expect(form.get('code')?.value).toBe('');
      expect(form.get('code')?.hasError('required')).toBe(true);
    });

    it('should initialize signals with default values', () => {
      // Arrange & Act & Assert
      expect(component.passwordVisible()).toBe(false);
      expect(component.submitting()).toBe(false);
      expect(component.submitted()).toBe(false);
      expect(component.codeExpiresIn()).toBe('');
    });

    it('should validate email matches session user email', () => {
      // Arrange
      const form = component.step1Form;

      // Act
      form.get('email')?.setValue('wrong@example.com');

      // Assert
      expect(form.get('email')?.hasError('pattern')).toBe(true);
    });

    it('should accept email that matches session user email', () => {
      // Arrange
      const form = component.step1Form;

      // Act
      form.get('email')?.setValue('test@example.com');

      // Assert
      expect(form.get('email')?.valid).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize code if exists in storage', () => {
      // Arrange
      const expiresAt = moment().add(5, 'minutes');
      mockStorageService.get = vi.fn().mockReturnValue(expiresAt.toString());

      // Recreate component with new mock
      TestBed.resetTestingModule();
      TestBed.overrideComponent(DeleteUser, {
        remove: { templateUrl: './delete-user.html', styleUrl: './delete-user.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      TestBed.configureTestingModule({
        imports: [DeleteUser, ReactiveFormsModule, MatDialogModule],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: AppManager, useValue: mockAppManager },
          { provide: AuthService, useValue: mockAuthService },
          { provide: Session, useValue: mockSession },
          { provide: StorageService, useValue: mockStorageService },
          { provide: MessageService, useValue: mockMessageService }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(DeleteUser);
      component = fixture.componentInstance;

      // Act
      component.ngOnInit();

      // Assert
      expect(mockStorageService.get).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_dce`,
        'local'
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from codeTimeInterval if exists', () => {
      // Arrange
      const unsubscribeSpy = vi.fn();
      (component as any).codeTimeInterval = {
        unsubscribe: unsubscribeSpy
      } as any;

      // Act
      component.ngOnDestroy();

      // Assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should not throw error if codeTimeInterval is null', () => {
      // Arrange
      (component as any).codeTimeInterval = null;

      // Act & Assert
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('generateCode', () => {
    it('should not generate code when step1Form is invalid', async () => {
      // Arrange
      component.step1Form.get('email')?.setValue('');

      // Act
      await component.generateCode();

      // Assert
      expect(component.submitting()).toBe(false);
    });

    it('should generate code when step1Form is valid', async () => {
      // Arrange
      component.step1Form.patchValue({
        email: 'test@example.com'
      });

      // Act
      const generatePromise = component.generateCode();
      expect(component.submitting()).toBe(true);
      expect(component.step1Form.disabled).toBe(true);

      const req = httpMock.expectOne(getApiUrl('generate-delete-code'));
      expect(req.request.method).toBe('POST');
      const expiresAt = moment().add(5, 'minutes');
      req.flush(expiresAt.toString());

      await generatePromise;

      // Assert
      expect(component.submitting()).toBe(false);
      expect(component.step1Form.enabled).toBe(true);
      expect(mockStorageService.set).toHaveBeenCalled();
    });

    it('should handle error on generateCode', async () => {
      // Arrange
      component.step1Form.patchValue({
        email: 'test@example.com'
      });
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error' },
        status: 400,
        statusText: 'Bad Request'
      });

      // Act
      const generatePromise = component.generateCode();

      const req = httpMock.expectOne(getApiUrl('generate-delete-code'));
      req.error(errorResponse.error, errorResponse);

      await generatePromise;

      // Assert
      expect(component.submitting()).toBe(false);
      expect(component.step1Form.enabled).toBe(true);
      expect(mockMessageService.show).toHaveBeenCalled();
    });
  });

  describe('requestDelete', () => {
    it('should not request delete when step2Form is invalid', async () => {
      // Arrange
      component.step2Form.get('code')?.setValue('');

      // Act
      await component.requestDelete();

      // Assert
      expect(component.submitting()).toBe(false);
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });

    it('should request delete when step2Form is valid', async () => {
      // Arrange
      component.step2Form.patchValue({
        code: '123456'
      });

      // Act
      const deletePromise = component.requestDelete();
      expect(component.submitting()).toBe(true);
      expect(component.step2Form.disabled).toBe(true);

      const req = httpMock.expectOne(getApiUrl('delete-user'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ code: '123456' });
      req.flush({});

      await deletePromise;

      // Assert
      expect(component.submitting()).toBe(false);
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockStorageService.delete).toHaveBeenCalledWith('lastUser', 'local');
    });

    it('should handle error on requestDelete', async () => {
      // Arrange
      component.step2Form.patchValue({
        code: '123456'
      });
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error' },
        status: 400,
        statusText: 'Bad Request'
      });

      // Act
      const deletePromise = component.requestDelete();

      const req = httpMock.expectOne(getApiUrl('delete-user'));
      req.error(errorResponse.error, errorResponse);

      await deletePromise;

      // Assert
      expect(component.submitting()).toBe(false);
      expect(component.step2Form.enabled).toBe(true);
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should set submitted to true', () => {
      // Arrange
      expect(component.submitted()).toBe(false);

      // Act
      component.submit();

      // Assert
      expect(component.submitted()).toBe(true);
    });

    it('should call generateCode when codeExpiresIn is empty', () => {
      // Arrange
      component.codeExpiresIn.set('');
      const generateCodeSpy = vi.spyOn(component, 'generateCode');

      // Act
      component.submit();

      // Assert
      expect(generateCodeSpy).toHaveBeenCalled();
    });

    it('should call requestDelete when codeExpiresIn is not empty', () => {
      // Arrange
      component.codeExpiresIn.set('05:00');
      const requestDeleteSpy = vi.spyOn(component, 'requestDelete');

      // Act
      component.submit();

      // Assert
      expect(requestDeleteSpy).toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, computed } from '@angular/core';
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
import { getApiUrl } from '@/core/utils/async-resources';
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
    mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'],
      firstName: 'Test',
      lastName: 'User',
      picture: 'https://example.com/picture.jpg'
    };

    mockAppManager = {};
    mockAuthService = { logout: vi.fn() };
    mockSession = { user: computed(() => mockUser) };
    mockStorageService = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      delete: vi.fn()
    };
    mockMessageService = {
      show: vi.fn().mockReturnValue(of(undefined))
    };

    TestBed.overrideComponent(DeleteUser, {
      remove: { templateUrl: './delete-user.html', styleUrl: './delete-user.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [DeleteUser, MatDialogModule],
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
      expect(component).toBeTruthy();
    });

    it('should inject dependencies', () => {
      expect(component.appManager).toBeDefined();
      expect(component.authService).toBeDefined();
      expect(component.session).toBeDefined();
    });

    it('should initialize step1Form with email validator', () => {
      const model = component.step1Model();
      expect(component.step1Form).toBeDefined();
      expect(model.email).toBe('');
      expect(component.step1Form.email().invalid()).toBe(true);
    });

    it('should initialize step2Form with code validator', () => {
      const model = component.step2Model();
      expect(component.step2Form).toBeDefined();
      expect(model.code).toBe('');
      expect(component.step2Form.code().invalid()).toBe(true);
    });

    it('should initialize signals with default values', () => {
      expect(component.passwordVisible()).toBe(false);
      expect(component.submitting()).toBe(false);
      expect(component.submitted()).toBe(false);
      expect(component.codeExpiresIn()).toBe('');
    });

    it('should validate email matches session user email', () => {
      component.step1Model.set({ email: 'wrong@example.com' });
      const errors = component.step1Form.email().errors();
      expect(errors.some((e) => e.kind === 'pattern')).toBe(true);
    });

    it('should accept email that matches session user email', () => {
      component.step1Model.set({ email: 'test@example.com' });
      expect(component.step1Form.email().valid()).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize code if exists in storage', () => {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      mockStorageService.get = vi.fn().mockReturnValue(expiresAt.toISOString());

      TestBed.resetTestingModule();
      TestBed.overrideComponent(DeleteUser, {
        remove: { templateUrl: './delete-user.html', styleUrl: './delete-user.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      TestBed.configureTestingModule({
        imports: [DeleteUser, MatDialogModule],
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

      component.ngOnInit();

      expect(mockStorageService.get).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_dce`,
        'local'
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from codeTimeInterval if exists', () => {
      const unsubscribeSpy = vi.fn();
      (component as any).codeTimeInterval = {
        unsubscribe: unsubscribeSpy
      } as any;

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should not throw error if codeTimeInterval is null', () => {
      (component as any).codeTimeInterval = null;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('generateCode', () => {
    it('should not generate code when step1Form is invalid', async () => {
      component.step1Model.set({ email: '' });
      await component.generateCode();
      expect(component.submitting()).toBe(false);
    });

    it('should generate code when step1Form is valid', async () => {
      component.step1Model.set({ email: 'test@example.com' });

      const generatePromise = component.generateCode();

      const req = httpMock.expectOne(getApiUrl('generate-delete-code'));
      expect(req.request.method).toBe('POST');
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      req.flush(expiresAt.toISOString());

      await generatePromise;

      expect(component.submitting()).toBe(false);
      expect(mockStorageService.set).toHaveBeenCalled();
    });

    it('should handle error on generateCode', async () => {
      component.step1Model.set({ email: 'test@example.com' });
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error' },
        status: 400,
        statusText: 'Bad Request'
      });

      const generatePromise = component.generateCode();

      const req = httpMock.expectOne(getApiUrl('generate-delete-code'));
      req.error(errorResponse.error, errorResponse);

      await generatePromise;

      expect(component.submitting()).toBe(false);
      expect(mockMessageService.show).toHaveBeenCalled();
    });
  });

  describe('requestDelete', () => {
    it('should not request delete when step2Form is invalid', async () => {
      component.step2Model.set({ code: '' });
      await component.requestDelete();
      expect(component.submitting()).toBe(false);
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });

    it('should request delete when step2Form is valid', async () => {
      component.step2Model.set({ code: '123456' });

      const deletePromise = component.requestDelete();

      const req = httpMock.expectOne(getApiUrl('delete-user'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ code: '123456' });
      req.flush({});

      await deletePromise;

      expect(component.submitting()).toBe(false);
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockStorageService.delete).toHaveBeenCalledWith('lastUser', 'local');
    });

    it('should handle error on requestDelete', async () => {
      component.step2Model.set({ code: '123456' });
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error' },
        status: 400,
        statusText: 'Bad Request'
      });

      const deletePromise = component.requestDelete();

      const req = httpMock.expectOne(getApiUrl('delete-user'));
      req.error(errorResponse.error, errorResponse);

      await deletePromise;

      expect(component.submitting()).toBe(false);
      expect(mockMessageService.show).toHaveBeenCalled();
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should set submitted to true', () => {
      expect(component.submitted()).toBe(false);
      component.submit();
      expect(component.submitted()).toBe(true);
    });

    it('should call generateCode when codeExpiresIn is empty', () => {
      component.codeExpiresIn.set('');
      const generateCodeSpy = vi.spyOn(component, 'generateCode');
      component.submit();
      expect(generateCodeSpy).toHaveBeenCalled();
    });

    it('should call requestDelete when codeExpiresIn is not empty', () => {
      component.codeExpiresIn.set('05:00');
      const requestDeleteSpy = vi.spyOn(component, 'requestDelete');
      component.submit();
      expect(requestDeleteSpy).toHaveBeenCalled();
    });
  });
});

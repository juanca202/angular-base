import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Navigation, Router, RouterModule, UrlTree } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Error } from './error';
import { AuthProvider } from '@factor_ec/utils';
import { Storage } from '@factor_ec/utils';
import { environment } from '@/environments/environment';
import { signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import {
  createMockRouter,
  createMockActivatedRoute,
  createMockStorageService,
  createMockTitle,
  COMMON_TEST_PROVIDERS
} from '@/test/mocks/angular-mocks';
import { createMockAuthProvider } from '@/test/mocks/service-mocks';
import { withMockLocation } from '@/test/helpers/window-helpers';

describe('Error', () => {
  let component: Error;
  let fixture: ComponentFixture<Error>;

  let mockAuthProvider: Partial<AuthProvider>;
  let mockStorage: ReturnType<typeof createMockStorageService>;
  let mockTitle: ReturnType<typeof createMockTitle>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;

  beforeEach(async () => {
    mockAuthProvider = createMockAuthProvider();
    mockStorage = createMockStorageService({
      get: vi.fn().mockReturnValue(null),
      delete: vi.fn()
    });
    mockTitle = createMockTitle();
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute();

    await TestBed.configureTestingModule({
      imports: [Error, RouterModule],
      providers: [
        { provide: AuthProvider, useValue: mockAuthProvider },
        ...COMMON_TEST_PROVIDERS.getCommonProviders({
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          title: mockTitle,
          storageService: mockStorage
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Error);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should set default error title on init', () => {
      component.ngOnInit();
      expect(mockTitle.setTitle).toHaveBeenCalled();
    });

    it('should initialize with undefined error', () => {
      expect(component.error()).toBeUndefined();
    });
  });

  describe('setError', () => {
    it('should set error for code 404 (Not Found)', () => {
      mockActivatedRoute = {
        snapshot: {
          params: { code: '404' },
          data: {}
        } as any
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [Error, RouterModule],
        providers: [
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Storage, useValue: mockStorage },
          { provide: Title, useValue: mockTitle },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
        ]
      });

      fixture = TestBed.createComponent(Error);
      component = fixture.componentInstance;

      component.ngOnInit();

      const error = component.error();
      expect(error?.icon).toBe('404');
      expect(error?.title).toContain('Not Found');
    });

    it('should use message from router state when available', () => {
      const customMessage = 'Custom error message';

      const navigation: Navigation = {
        id: 1,
        initialUrl: {} as UrlTree,
        extractedUrl: {} as UrlTree,
        trigger: 'imperative',
        extras: { state: { message: customMessage } },
        previousNavigation: null,
        abort: () => {}
      };

      mockRouter = {
        navigateByUrl: vi.fn(),
        parseUrl: vi.fn().mockReturnValue({} as UrlTree),
        createUrlTree: vi.fn().mockReturnValue({} as UrlTree),
        serializeUrl: vi.fn().mockReturnValue(''),
        events: EMPTY,
        currentNavigation: signal<Navigation | null>(navigation)
      };

      mockActivatedRoute = {
        snapshot: {
          params: { code: '404' },
          data: {}
        } as any
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [Error, RouterModule],
        providers: [
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Storage, useValue: mockStorage },
          { provide: Title, useValue: mockTitle },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
        ]
      });

      fixture = TestBed.createComponent(Error);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(component.message).toBe(customMessage);
    });

    it('should use message from storage when router state is not available', () => {
      const storageMessage = 'Storage error message';

      mockStorage = createMockStorageService({
        get: vi.fn().mockReturnValue(storageMessage),
        delete: vi.fn()
      });

      mockRouter = {
        currentNavigation: signal(null)
      };

      mockActivatedRoute = {
        snapshot: {
          params: { code: '404' },
          data: {}
        } as any
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [Error, RouterModule],
        providers: [
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Storage, useValue: mockStorage },
          { provide: Title, useValue: mockTitle },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
        ]
      });

      fixture = TestBed.createComponent(Error);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(component.message).toBe(storageMessage);
      expect(mockStorage.delete).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_msg`,
        'session'
      );
    });
  });

  describe('reload', () => {
    it('should reload the page', async () => {
      await withMockLocation(async ({ reloadSpy }) => {
        // Act
        component.reload();

        // Assert
        expect(reloadSpy).toHaveBeenCalled();
      });
    });
  });

  describe('setError codes', () => {
    const renderWithCode = (code: number | string): Error => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [Error, RouterModule],
        providers: [
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Storage, useValue: mockStorage },
          { provide: Title, useValue: mockTitle },
          { provide: Router, useValue: mockRouter },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { params: { code: String(code) }, data: {} } }
          }
        ]
      });

      const codeFixture = TestBed.createComponent(Error);
      codeFixture.componentInstance.ngOnInit();
      return codeFixture.componentInstance;
    };

    it('should set error for code 0 (Connection Error)', () => {
      // Act
      const error = renderWithCode(0).error();

      // Assert
      expect(error?.icon).toBe('0');
      expect(error?.title).toContain('Connection Error');
    });

    it('should set error for code 400 (Bad Request)', () => {
      // Act
      const error = renderWithCode(400).error();

      // Assert
      expect(error?.icon).toBe('400');
      expect(error?.title).toContain('Bad Request');
    });

    it('should set error for code 403 (Forbidden)', () => {
      // Act
      const error = renderWithCode(403).error();

      // Assert
      expect(error?.icon).toBe('403');
      expect(error?.title).toContain('Forbidden');
    });

    it('should set error for code 412 (Precondition Failed)', () => {
      // Act
      const error = renderWithCode(412).error();

      // Assert
      expect(error?.icon).toBe('412');
      expect(error?.title).toContain('Precondition Failed');
    });

    it('should set error for code 503 (Service Unavailable)', () => {
      // Act
      const error = renderWithCode(503).error();

      // Assert
      expect(error?.icon).toBe('503');
      expect(error?.title).toContain('Service Unavailable');
    });

    it('should set unknown error for an unmapped code', () => {
      // Act
      const error = renderWithCode(999).error();

      // Assert
      expect(error?.icon).toBe('unknown');
      expect(error?.title).toContain('Unknown Error');
    });

    it('should read the code from route data when not present in params', () => {
      // Arrange
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [Error, RouterModule],
        providers: [
          { provide: AuthProvider, useValue: mockAuthProvider },
          { provide: Storage, useValue: mockStorage },
          { provide: Title, useValue: mockTitle },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: { snapshot: { params: {}, data: { code: 404 } } } }
        ]
      });
      const dataFixture = TestBed.createComponent(Error);

      // Act
      dataFixture.componentInstance.ngOnInit();

      // Assert
      expect(dataFixture.componentInstance.error()?.icon).toBe('404');
    });
  });

  describe('template rendering', () => {
    const renderWithCode = (code: number, logout: ReturnType<typeof vi.fn>): ComponentFixture<Error> => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [Error, RouterModule],
        providers: [
          { provide: AuthProvider, useValue: { ...mockAuthProvider, logout } },
          { provide: Storage, useValue: mockStorage },
          { provide: Title, useValue: mockTitle },
          { provide: Router, useValue: mockRouter },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { params: { code: String(code) }, data: {} } }
          }
        ]
      });
      const renderFixture = TestBed.createComponent(Error);
      renderFixture.detectChanges();
      return renderFixture;
    };

    it('should render a "Go home" link for a 404 error', () => {
      // Act
      const renderFixture = renderWithCode(404, vi.fn().mockResolvedValue(false));

      // Assert
      const link = renderFixture.nativeElement.querySelector('a[routerLink]');
      expect(link).not.toBeNull();
      expect(renderFixture.nativeElement.querySelector('h1').textContent).toContain('Not Found');
    });

    it('should render a "Logout" button for a 403 error', () => {
      // Act
      const renderFixture = renderWithCode(403, vi.fn().mockResolvedValue(true));

      // Assert
      const buttons = renderFixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(1);
      expect(renderFixture.nativeElement.querySelector('a[routerLink]')).toBeNull();
    });

    it('should call authProvider.logout when the Logout button is clicked', () => {
      // Arrange
      const logout = vi.fn().mockResolvedValue(true);
      const renderFixture = renderWithCode(403, logout);
      const button: HTMLButtonElement = renderFixture.nativeElement.querySelector('button');

      // Act
      button.click();

      // Assert
      expect(logout).toHaveBeenCalled();
    });

    it('should render a "Reload" button for an unknown error', () => {
      // Act
      const renderFixture = renderWithCode(999, vi.fn().mockResolvedValue(true));

      // Assert
      const buttons = renderFixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(1);
    });

    it('should not render a recovery action for a 400 error', () => {
      // Act
      const renderFixture = renderWithCode(400, vi.fn().mockResolvedValue(true));

      // Assert
      expect(renderFixture.nativeElement.querySelector('a[routerLink]')).toBeNull();
      expect(renderFixture.nativeElement.querySelector('button')).toBeNull();
    });
  });
});

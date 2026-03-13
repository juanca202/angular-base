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
});

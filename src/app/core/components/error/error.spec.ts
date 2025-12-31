import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Navigation, Router, RouterModule, UrlTree } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Error } from './error';
import { AuthProvider } from '@/core/services/auth.provider';
import { StorageService } from '@factor_ec/utils';
import { environment } from '@/environments/environment';
import { signal } from '@angular/core';
import { EMPTY } from 'rxjs';

describe('Error', () => {
  let component: Error;
  let fixture: ComponentFixture<Error>;

  let mockAuthProvider: Partial<AuthProvider>;
  let mockStorageService: Partial<StorageService>;
  let mockTitle: Title;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    mockAuthProvider = {};

    mockStorageService = {
      get: vi.fn().mockReturnValue(null),
      delete: vi.fn()
    };

    mockTitle = {
      setTitle: vi.fn()
    } as any;

    mockRouter = {
      navigateByUrl: vi.fn(),
      parseUrl: vi.fn().mockImplementation(() => {
        return {} as UrlTree;
      }),
      createUrlTree: vi.fn().mockReturnValue({} as UrlTree),
      serializeUrl: vi.fn().mockReturnValue(''),
      events: EMPTY,
      currentNavigation: signal<Navigation | null>(null)
    };

    mockActivatedRoute = {
      snapshot: {
        params: {},
        data: {}
      } as any
    };

    await TestBed.configureTestingModule({
      imports: [Error, RouterModule],
      providers: [
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: StorageService, useValue: mockStorageService },
        { provide: Title, useValue: mockTitle },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
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
          { provide: StorageService, useValue: mockStorageService },
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
          { provide: StorageService, useValue: mockStorageService },
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

      mockStorageService = {
        get: vi.fn().mockReturnValue(storageMessage),
        delete: vi.fn()
      };

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
          { provide: StorageService, useValue: mockStorageService },
          { provide: Title, useValue: mockTitle },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
        ]
      });

      fixture = TestBed.createComponent(Error);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(component.message).toBe(storageMessage);
      expect(mockStorageService.delete).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_msg`,
        'session'
      );
    });
  });

  describe('reload', () => {
    it('should reload the page', () => {
      // Arrange
      const reloadSpy = vi.fn();
      // Mock location completamente
      const originalLocation = window.location;
      const mockLocation = {
        ...originalLocation,
        reload: reloadSpy
      };
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: mockLocation
      });

      // Act
      component.reload();

      // Assert
      expect(reloadSpy).toHaveBeenCalled();

      // Cleanup
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation
      });
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Error } from './error';
import { AuthProvider } from '@/core/services/auth.provider';
import { StorageService } from '@factor_ec/utils';
import { environment } from '@/environments/environment';

describe('Error', () => {
  // Arrange
  let component: Error;
  let fixture: ComponentFixture<Error>;
  let mockAuthProvider: Partial<AuthProvider>;
  let mockStorageService: Partial<StorageService>;
  let mockTitle: Title;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    // Arrange: Create mocks
    mockAuthProvider = {};
    mockStorageService = {
      get: vi.fn().mockReturnValue(null),
      delete: vi.fn()
    };
    mockTitle = {
      setTitle: vi.fn()
    } as any;
    mockRouter = {
      currentNavigation: vi.fn().mockReturnValue(null)
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
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should set default error title on init', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      component.ngOnInit();

      // Assert
      expect(mockTitle.setTitle).toHaveBeenCalled();
    });

    it('should initialize with undefined error', () => {
      // Arrange & Act
      const error = component.error();

      // Assert
      expect(error).toBeUndefined();
    });
  });

  describe('setError', () => {
    it('should set error for code 0 (Connection Error)', () => {
      // Arrange
      mockActivatedRoute = {
        snapshot: {
          params: { code: '0' },
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

      // Act
      component.ngOnInit();

      // Assert
      const error = component.error();
      expect(error?.icon).toBe('0');
      expect(error?.title).toContain('Connection Error');
    });

    it('should set error for code 400 (Bad Request)', () => {
      // Arrange
      mockActivatedRoute = {
        snapshot: {
          params: { code: '400' },
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

      // Act
      component.ngOnInit();

      // Assert
      const error = component.error();
      expect(error?.icon).toBe('400');
      expect(error?.title).toContain('Bad Request');
    });

    it('should set error for code 403 (Forbidden)', () => {
      // Arrange
      mockActivatedRoute = {
        snapshot: {
          params: { code: '403' },
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

      // Act
      component.ngOnInit();

      // Assert
      const error = component.error();
      expect(error?.icon).toBe('403');
      expect(error?.title).toContain('Forbidden');
    });

    it('should set error for code 404 (Not Found)', () => {
      // Arrange
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

      // Act
      component.ngOnInit();

      // Assert
      const error = component.error();
      expect(error?.icon).toBe('404');
      expect(error?.title).toContain('Not Found');
    });

    it('should set error for code 503 (Service Unavailable)', () => {
      // Arrange
      mockActivatedRoute = {
        snapshot: {
          params: { code: '503' },
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

      // Act
      component.ngOnInit();

      // Assert
      const error = component.error();
      expect(error?.icon).toBe('503');
      expect(error?.title).toContain('Service Unavailable');
    });

    it('should set default error for unknown code', () => {
      // Arrange
      mockActivatedRoute = {
        snapshot: {
          params: { code: '999' },
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

      // Act
      component.ngOnInit();

      // Assert
      const error = component.error();
      expect(error?.icon).toBe('unknown');
      expect(error?.title).toContain('Unknown Error');
    });

    it('should use message from router state when available', () => {
      // Arrange
      const customMessage = 'Custom error message';
      mockRouter = {
        currentNavigation: vi.fn().mockReturnValue({
          extras: { state: { message: customMessage } }
        })
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

      // Act
      component.ngOnInit();

      // Assert
      expect(component.message).toBe(customMessage);
    });

    it('should use message from storage when router state is not available', () => {
      // Arrange
      const storageMessage = 'Storage error message';
      mockStorageService = {
        get: vi.fn().mockReturnValue(storageMessage),
        delete: vi.fn()
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

      // Act
      component.ngOnInit();

      // Assert
      expect(component.message).toBe(storageMessage);
      expect(mockStorageService.delete).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_msg`,
        'session'
      );
    });

    it('should get code from route data when not in params', () => {
      // Arrange
      mockActivatedRoute = {
        snapshot: {
          params: {},
          data: { code: '404' }
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

      // Act
      component.ngOnInit();

      // Assert
      const error = component.error();
      expect(error?.icon).toBe('404');
    });
  });

  describe('reload', () => {
    it('should reload the page', () => {
      // Arrange
      const reloadSpy = vi.spyOn(location, 'reload').mockImplementation(() => {});

      // Act
      component.reload();

      // Assert
      expect(reloadSpy).toHaveBeenCalled();
      reloadSpy.mockRestore();
    });
  });
});

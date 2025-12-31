import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Language } from './language';
import { AppManager } from '@/core/services/app-manager';
import { StorageService, Language as LanguageModel } from '@factor_ec/utils';
import { environment } from '@/environments/environment';
import { signal } from '@angular/core';
import {
  createMockTitle,
  createMockRouter,
  createMockActivatedRoute,
  createMockStorageService,
  COMMON_TEST_PROVIDERS
} from '@/core/testing/test-mocks';

describe('Language', () => {
  // Arrange
  let component: Language;
  let fixture: ComponentFixture<Language>;
  let mockAppManager: Partial<AppManager>;
  let mockStorageService: Partial<StorageService>;
  let mockTitle: ReturnType<typeof createMockTitle>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;

  beforeEach(async () => {
    // Arrange: Create mocks using factory functions
    mockAppManager = {
      getLocale: vi.fn().mockReturnValue('en'),
      languages: signal<LanguageModel[]>([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' }
      ])
    };
    mockStorageService = createMockStorageService({
      set: vi.fn()
    });
    mockTitle = createMockTitle();
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute();

    await TestBed.configureTestingModule({
      imports: [Language, RouterModule],
      providers: [
        { provide: AppManager, useValue: mockAppManager },
        { provide: StorageService, useValue: mockStorageService },
        ...COMMON_TEST_PROVIDERS.getCommonProviders({
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          title: mockTitle,
          storageService: mockStorageService
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Language);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create component', () => {
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should set title on construction', () => {
      // Arrange & Act
      // Component is already created in beforeEach

      // Assert
      expect(mockTitle.setTitle).toHaveBeenCalled();
    });

    it('should initialize locale from AppManager', () => {
      // Arrange & Act
      const locale = component.locale();

      // Assert
      expect(locale).toBe('en');
      expect(mockAppManager.getLocale).toHaveBeenCalled();
    });
  });

  describe('select', () => {
    it('should save language to storage and reload page', async () => {
      // Arrange
      const language: LanguageModel = { code: 'es', name: 'Español' };
      const reloadSpy = vi.fn();
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
      await component.select(language);

      // Assert
      expect(mockStorageService.set).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_loc`,
        'es',
        'local'
      );
      expect(reloadSpy).toHaveBeenCalled();

      // Cleanup
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation
      });
    });

    it('should save English language to storage', async () => {
      // Arrange
      const language: LanguageModel = { code: 'en', name: 'English' };
      const reloadSpy = vi.fn();
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
      await component.select(language);

      // Assert
      expect(mockStorageService.set).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_loc`,
        'en',
        'local'
      );
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

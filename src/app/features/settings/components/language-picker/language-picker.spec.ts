import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { LanguagePicker } from './language-picker';
import { AppManager } from '@/core/services/app-manager';
import { Language as LanguageModel } from '@/core/models/language';
import { Storage } from '@factor_ec/utils';
import { environment } from '@/environments/environment';
import { signal } from '@angular/core';
import {
  createMockRouter,
  createMockActivatedRoute,
  createMockStorageService,
  COMMON_TEST_PROVIDERS
} from '@/test/mocks/angular-mocks';
import { createMockAppManager } from '@/test/mocks/service-mocks';
import { withMockLocation } from '@/test/helpers/window-helpers';

describe('LanguagePicker', () => {
  // Arrange
  let component: LanguagePicker;
  let fixture: ComponentFixture<LanguagePicker>;
  let mockAppManager: ReturnType<typeof createMockAppManager>;
  let mockStorage: ReturnType<typeof createMockStorageService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;

  beforeEach(async () => {
    // Arrange: Create mocks using factory functions
    mockAppManager = createMockAppManager({
      getLocale: vi.fn().mockReturnValue('en'),
      languages: signal<LanguageModel[]>([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' }
      ])
    });
    mockStorage = createMockStorageService({
      set: vi.fn()
    });
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute();

    await TestBed.configureTestingModule({
      imports: [LanguagePicker, RouterModule],
      providers: [
        { provide: AppManager, useValue: mockAppManager },
        { provide: Storage, useValue: mockStorage },
        ...COMMON_TEST_PROVIDERS.getCommonProviders({
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          storageService: mockStorage
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguagePicker);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create component', () => {
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
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
      await withMockLocation(async ({ reloadSpy }) => {
        // Arrange
        const language: LanguageModel = { code: 'es', name: 'Español' };

        // Act
        await component.select(language);

        // Assert
        expect(mockStorage.set).toHaveBeenCalledWith(
          `${environment.sessionPrefix}_loc`,
          'es',
          'local'
        );
        expect(reloadSpy).toHaveBeenCalled();
      });
    });

    it('should save English language to storage', async () => {
      await withMockLocation(async ({ reloadSpy }) => {
        // Arrange
        const language: LanguageModel = { code: 'en', name: 'English' };

        // Act
        await component.select(language);

        // Assert
        expect(mockStorage.set).toHaveBeenCalledWith(
          `${environment.sessionPrefix}_loc`,
          'en',
          'local'
        );
        expect(reloadSpy).toHaveBeenCalled();
      });
    });
  });
});

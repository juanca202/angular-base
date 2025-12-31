import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Language } from './language';
import { AppManager } from '@/core/services/app-manager';
import { StorageService, Language as LanguageModel } from '@factor_ec/utils';
import { environment } from '@/environments/environment';

describe('Language', () => {
  // Arrange
  let component: Language;
  let fixture: ComponentFixture<Language>;
  let mockAppManager: Partial<AppManager>;
  let mockStorageService: Partial<StorageService>;
  let mockTitle: Title;

  beforeEach(async () => {
    // Arrange: Create mocks
    mockAppManager = {
      getLocale: vi.fn().mockReturnValue('en'),
      languages: vi.fn().mockReturnValue([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' }
      ])
    };
    mockStorageService = {
      set: vi.fn()
    };
    mockTitle = {
      setTitle: vi.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [Language, RouterModule],
      providers: [
        { provide: AppManager, useValue: mockAppManager },
        { provide: StorageService, useValue: mockStorageService },
        { provide: Title, useValue: mockTitle }
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
      const reloadSpy = vi.spyOn(location, 'reload').mockImplementation(() => {});

      // Act
      await component.select(language);

      // Assert
      expect(mockStorageService.set).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_loc`,
        'es',
        'local'
      );
      expect(reloadSpy).toHaveBeenCalled();
      reloadSpy.mockRestore();
    });

    it('should save English language to storage', async () => {
      // Arrange
      const language: LanguageModel = { code: 'en', name: 'English' };
      const reloadSpy = vi.spyOn(location, 'reload').mockImplementation(() => {});

      // Act
      await component.select(language);

      // Assert
      expect(mockStorageService.set).toHaveBeenCalledWith(
        `${environment.sessionPrefix}_loc`,
        'en',
        'local'
      );
      reloadSpy.mockRestore();
    });
  });
});

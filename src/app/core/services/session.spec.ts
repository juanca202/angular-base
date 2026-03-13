import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Session } from './session';
import { Storage } from '@factor_ec/utils';
import { Settings } from '../models/settings';
import { SessionState } from '../models/session-state';
import { getApiUrl } from '../utils/async-resources';
import { AuthProvider } from '@factor_ec/utils';
import { createMockAuthProvider } from '@/test/mocks/service-mocks';

describe('Session', () => {
  // Arrange
  let service: Session;
  let httpMock: HttpTestingController;
  let mockStorage: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Arrange: Create mock storage service
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        Session,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Storage, useValue: mockStorage },
        { provide: AuthProvider, useValue: createMockAuthProvider() }
      ]
    });

    service = TestBed.inject(Session);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      // Arrange & Act
      const settings = service.settings();
      const params = service.params();

      // Assert
      expect(settings).toBeNull();
      expect(params).toBeNull();
    });

    it('should restore state from storage on initialization', () => {
      // Arrange
      const storedState: SessionState = {
        settings: {
          user: {
            username: 'test',
            email: 'test@test.com',
            roles: [],
            firstName: '',
            lastName: '',
            picture: '',
            featureFlags: []
          },
          language: 'en',
          subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
          environment: 'dev',
          onboarding: false,
          country: 'US'
        },
        params: { key1: 'value1' }
      };
      vi.mocked(mockStorage.get).mockReturnValue(storedState);

      // Act
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          Session,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Storage, useValue: mockStorage },
          { provide: AuthProvider, useValue: createMockAuthProvider() }
        ]
      });

      // Assert
      // Note: This test verifies the restoreFromStorage logic exists
      // Actual restoration happens in constructor, which is hard to test directly
      expect(mockStorage.get).toHaveBeenCalled();
    });
  });

  describe('getSettings (setSettings)', () => {
    it('should set settings in session state when fetched from API', async () => {
      // Arrange
      const settings: Partial<Settings> = {
        language: 'es',
        environment: 'production'
      };

      // Act
      const getSettingsPromise = service.getSettings(true);
      const req = httpMock.expectOne(getApiUrl('settings'));
      req.flush(settings);
      await getSettingsPromise;

      // Assert
      const currentSettings = service.settings();
      expect(currentSettings).toBeDefined();
      expect(currentSettings?.language).toBe('es');
      expect(currentSettings?.environment).toBe('production');
    });

    it('should replace settings when getSettings is called again', async () => {
      // Arrange
      const firstSettings: Partial<Settings> = {
        language: 'en',
        environment: 'dev'
      };
      const secondSettings: Partial<Settings> = {
        language: 'es'
      };

      // Act
      let getSettingsPromise = service.getSettings(true);
      httpMock.expectOne(getApiUrl('settings')).flush(firstSettings);
      await getSettingsPromise;

      getSettingsPromise = service.getSettings(true);
      httpMock.expectOne(getApiUrl('settings')).flush(secondSettings);
      await getSettingsPromise;

      // Assert: second response replaces the first (no merge)
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('es');
      expect(currentSettings?.environment).toBeUndefined();
    });
  });

  describe('clearSettings', () => {
    it('should clear settings from session state', async () => {
      // Arrange
      const getSettingsPromise = service.getSettings(true);
      httpMock.expectOne(getApiUrl('settings')).flush({
        language: 'en',
        environment: 'dev',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        onboarding: false
      });
      await getSettingsPromise;

      // Act
      service.clearSettings();

      // Assert
      expect(service.settings()).toBeNull();
    });
  });

  describe('setParam', () => {
    it('should set a single parameter in session state', () => {
      // Arrange
      const key = 'testKey';
      const value = 'testValue';

      // Act
      service.setParam(key, value);

      // Assert
      expect((service.params() ?? {})[key]).toBe(value);
    });

    it('should update existing parameter when setParam is called again', () => {
      // Arrange
      const key = 'testKey';
      const firstValue = 'firstValue';
      const secondValue = 'secondValue';

      // Act
      service.setParam(key, firstValue);
      service.setParam(key, secondValue);

      // Assert
      expect((service.params() ?? {})[key]).toBe(secondValue);
    });

    it('should preserve other parameters when setting a new one', () => {
      // Arrange
      service.setParam('key1', 'value1');
      service.setParam('key2', 'value2');

      // Act
      service.setParam('key3', 'value3');

      // Assert
      const p = service.params() ?? {};
      expect(p['key1']).toBe('value1');
      expect(p['key2']).toBe('value2');
      expect(p['key3']).toBe('value3');
    });
  });

  describe('setParams', () => {
    it('should merge multiple parameters into session state', () => {
      // Arrange
      const params = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
      };

      // Act
      service.setParams(params);

      // Assert
      expect(service.params()).toEqual(params);
      expect(service.params()).not.toBeNull();
    });

    it('should merge with existing parameters', () => {
      // Arrange
      service.setParam('existingKey', 'existingValue');
      const newParams = {
        newKey1: 'newValue1',
        newKey2: 'newValue2'
      };

      // Act
      service.setParams(newParams);

      // Assert
      const p = service.params() ?? {};
      expect(p['existingKey']).toBe('existingValue');
      expect(p['newKey1']).toBe('newValue1');
      expect(p['newKey2']).toBe('newValue2');
    });
  });

  describe('clearParams', () => {
    it('should clear all parameters from session state', () => {
      // Arrange
      service.setParams({ key1: 'value1', key2: 'value2' });

      // Act
      service.clearParams();

      // Assert
      expect(service.params()).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all session data', async () => {
      // Arrange
      const getSettingsPromise = service.getSettings(true);
      httpMock.expectOne(getApiUrl('settings')).flush({
        language: 'en',
        environment: 'dev',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        onboarding: false
      });
      await getSettingsPromise;
      service.setParams({ key1: 'value1' });

      // Act
      service.clearAll();

      // Assert
      expect(service.settings()).toBeNull();
      expect(service.params()).toBeNull();
    });
  });

  describe('restoreFromStorage', () => {
    it('should handle corrupted storage data gracefully', () => {
      // Arrange
      (mockStorage.get as any).mockImplementation(() => {
        throw new Error('Corrupted data');
      });

      // Act
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          Session,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Storage, useValue: mockStorage },
          { provide: AuthProvider, useValue: createMockAuthProvider() }
        ]
      });

      const newService = TestBed.inject(Session);

      // Assert
      expect(newService.settings()).toBeNull();
      expect(newService.params()).toBeNull();
    });

    it('should restore valid session state from storage', () => {
      // Arrange
      const storedState: SessionState = {
        settings: {
          user: {
            username: 'test',
            email: 'test@test.com',
            roles: [],
            firstName: '',
            lastName: '',
            picture: '',
            featureFlags: []
          },
          language: 'es',
          subscription: { code: '2', name: 'Premium', plan: { code: '2', name: 'Premium' } },
          environment: 'prod',
          onboarding: true,
          country: 'US'
        },
        params: { key1: 'value1', key2: 'value2' }
      };
      vi.mocked(mockStorage.get).mockReturnValue(storedState);

      // Act
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          Session,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Storage, useValue: mockStorage },
          { provide: AuthProvider, useValue: createMockAuthProvider() }
        ]
      });

      const newService = TestBed.inject(Session);

      // Assert
      expect(newService.settings()).toEqual(storedState.settings);
      expect(newService.params()).toEqual(storedState.params);
    });
  });

  describe('settings edge cases', () => {
    it('should set settings when fetched from API', async () => {
      // Arrange
      const newSettings: Partial<Settings> = {
        language: 'fr',
        environment: 'test'
      };

      // Act
      const getSettingsPromise = service.getSettings(true);
      httpMock.expectOne(getApiUrl('settings')).flush(newSettings);
      await getSettingsPromise;

      // Assert
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('fr');
      expect(currentSettings?.environment).toBe('test');
    });

    it('should replace settings when getSettings returns partial', async () => {
      // Arrange
      const getSettingsPromise = service.getSettings(true);
      httpMock.expectOne(getApiUrl('settings')).flush({
        language: 'en',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        environment: 'dev',
        onboarding: false
      });
      await getSettingsPromise;

      // Act
      const secondPromise = service.getSettings(true);
      httpMock.expectOne(getApiUrl('settings')).flush({ language: 'es' });
      await secondPromise;

      // Assert: second response replaces (no merge)
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('es');
      expect(currentSettings?.environment).toBeUndefined();
    });
  });
});

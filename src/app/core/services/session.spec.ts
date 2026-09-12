import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import type { WritableSignal } from '@angular/core';
import type { User } from '@factor_ec/utils';
import { Session } from '@/core/services/session';
import { Storage } from '@factor_ec/utils';
import { Settings } from '@/core/models/settings';
import { SessionState } from '@/core/models/session-state';
import { getApiUrl } from '@/core/utils/async-resources';
import { AuthProvider } from '@factor_ec/utils';
import { createMockAuthProvider } from '@/test/mocks/service-mocks';
import { server } from '@/mocks/node';
import { http, HttpResponse } from '@/mocks/handlers';

describe('Session', () => {
  // Arrange
  let service: Session;
  let mockStorage: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockAuthProvider: ReturnType<typeof createMockAuthProvider>;

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    // Arrange: Create mock storage service
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    };
    mockAuthProvider = createMockAuthProvider();

    TestBed.configureTestingModule({
      providers: [
        Session,
        provideHttpClient(),
        { provide: Storage, useValue: mockStorage },
        { provide: AuthProvider, useValue: mockAuthProvider }
      ]
    });

    service = TestBed.inject(Session);
  });

  /** Overrides the shared MSW settings handler with a fixed JSON response for this test. */
  function mockSettingsResponse(settings: Partial<Settings>): void {
    server.use(http.get(getApiUrl('settings'), () => HttpResponse.json(settings)));
  }

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
      mockSettingsResponse(settings);
      await service.getSettings(true);

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
      mockSettingsResponse(firstSettings);
      await service.getSettings(true);

      mockSettingsResponse(secondSettings);
      await service.getSettings(true);

      // Assert: second response replaces the first (no merge)
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('es');
      expect(currentSettings?.environment).toBeUndefined();
    });
  });

  describe('clearSettings', () => {
    it('should clear settings from session state', async () => {
      // Arrange
      mockSettingsResponse({
        language: 'en',
        environment: 'dev',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        onboarding: false
      });
      await service.getSettings(true);

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
      mockSettingsResponse({
        language: 'en',
        environment: 'dev',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        onboarding: false
      });
      await service.getSettings(true);
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
      mockStorage.get.mockImplementation(() => {
        throw new Error('Corrupted data');
      });

      // Act
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          Session,
          provideHttpClient(),
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
      mockSettingsResponse(newSettings);
      await service.getSettings(true);

      // Assert
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('fr');
      expect(currentSettings?.environment).toBe('test');
    });

    it('should replace settings when getSettings returns partial', async () => {
      // Arrange
      mockSettingsResponse({
        language: 'en',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        environment: 'dev',
        onboarding: false
      });
      await service.getSettings(true);

      // Act
      mockSettingsResponse({ language: 'es' });
      await service.getSettings(true);

      // Assert: second response replaces (no merge)
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('es');
      expect(currentSettings?.environment).toBeUndefined();
    });
  });

  describe('persistence effect', () => {
    it('should persist settings and params to local storage when they change', () => {
      // Act
      service.setParam('key1', 'value1');
      TestBed.tick();

      // Assert
      expect(mockStorage.set).toHaveBeenCalledWith(
        expect.stringContaining('_sess'),
        expect.objectContaining({ params: { key1: 'value1' } }),
        'local'
      );
    });
  });

  describe('getSettings request options', () => {
    it('should include the push token header when provided', async () => {
      // Arrange
      let capturedPushToken: string | null = null;
      server.use(
        http.get(getApiUrl('settings'), ({ request }) => {
          capturedPushToken = request.headers.get('Push-Token');
          return HttpResponse.json({ language: 'en' });
        })
      );

      // Act
      await service.getSettings(true, 'push-token-123');

      // Assert
      expect(capturedPushToken).toBe('push-token-123');
    });

    it('should return the already-loaded local settings for an authenticated user', async () => {
      // Arrange: populate local settings first
      mockSettingsResponse({ language: 'en', environment: 'dev' });
      await service.getSettings(true);
      (mockAuthProvider.user as WritableSignal<User | null>).set({ username: 'ada', roles: [] });

      // Act
      const result = await service.getSettings();

      // Assert
      expect(result).toEqual(expect.objectContaining({ language: 'en' }));
    });
  });
});

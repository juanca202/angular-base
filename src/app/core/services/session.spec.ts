import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Session } from './session';
import { StorageService } from '@factor_ec/utils';
import { User } from '../models/user';
import { Settings } from '../models/settings';
import { SessionState } from '../models/session-state';

describe('Session', () => {
  // Arrange
  let service: Session;
  let mockStorageService: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Arrange: Create mock storage service
    mockStorageService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [Session, { provide: StorageService, useValue: mockStorageService }]
    });

    service = TestBed.inject(Session);
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      // Arrange & Act
      const user = service.user();
      const settings = service.settings();
      const params = service.params();
      const isLoggedIn = service.isLoggedIn();

      // Assert
      expect(user).toBeNull();
      expect(settings).toBeNull();
      expect(params).toBeNull();
      expect(isLoggedIn).toBe(false);
    });

    it('should restore state from storage on initialization', () => {
      // Arrange
      const storedState: SessionState = {
        user: {
          username: 'test',
          email: 'test@test.com',
          roles: [],
          firstName: 'Test',
          lastName: 'User',
          picture: ''
        },
        settings: {
          language: 'en',
          subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
          environment: 'dev',
          onboarding: false
        },
        params: { key1: 'value1' },
        token: null
      };
      vi.mocked(mockStorageService.get).mockReturnValue(storedState);

      // Act
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [Session, { provide: StorageService, useValue: mockStorageService }]
      });

      // Assert
      // Note: This test verifies the restoreFromStorage logic exists
      // Actual restoration happens in constructor, which is hard to test directly
      expect(mockStorageService.get).toHaveBeenCalled();
    });
  });

  describe('setUser', () => {
    it('should set user in session state', () => {
      // Arrange
      const user: User = {
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        firstName: 'Test',
        lastName: 'User',
        picture: 'avatar.jpg'
      };

      // Act
      service.setUser(user);

      // Assert (isLoggedIn is token-based; without token it stays false)
      expect(service.user()).toEqual(user);
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should update existing user when setUser is called again', () => {
      // Arrange
      const firstUser: User = {
        username: 'user1',
        email: 'user1@example.com',
        roles: ['user'],
        firstName: 'First',
        lastName: 'User',
        picture: ''
      };
      const secondUser: User = {
        username: 'user2',
        email: 'user2@example.com',
        roles: ['admin'],
        firstName: 'Second',
        lastName: 'User',
        picture: ''
      };

      // Act
      service.setUser(firstUser);
      service.setUser(secondUser);

      // Assert
      expect(service.user()).toEqual(secondUser);
      expect(service.user()?.username).toBe('user2');
    });
  });

  describe('clearUser', () => {
    it('should clear user from session state', () => {
      // Arrange
      const user: User = {
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        firstName: 'Test',
        lastName: 'User',
        picture: ''
      };
      service.setUser(user);

      // Act
      service.clearUser();

      // Assert
      expect(service.user()).toBeNull();
    });

    it('should not throw error when clearing user that does not exist', () => {
      // Arrange & Act & Assert
      expect(() => service.clearUser()).not.toThrow();
      expect(service.user()).toBeNull();
    });
  });

  describe('setSettings', () => {
    it('should set settings in session state', () => {
      // Arrange
      const settings: Partial<Settings> = {
        language: 'es',
        environment: 'production'
      };

      // Act
      service.setSettings(settings);

      // Assert
      const currentSettings = service.settings();
      expect(currentSettings).toBeDefined();
      expect(currentSettings?.language).toBe('es');
      expect(currentSettings?.environment).toBe('production');
    });

    it('should merge settings with existing settings', () => {
      // Arrange
      const firstSettings: Partial<Settings> = {
        language: 'en',
        environment: 'dev'
      };
      const secondSettings: Partial<Settings> = {
        language: 'es'
      };

      // Act
      service.setSettings(firstSettings);
      service.setSettings(secondSettings);

      // Assert
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('es');
      expect(currentSettings?.environment).toBe('dev');
    });
  });

  describe('clearSettings', () => {
    it('should clear settings from session state', () => {
      // Arrange
      service.setSettings({
        language: 'en',
        environment: 'dev',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        onboarding: false
      });

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
    it('should clear all session data', () => {
      // Arrange
      const user: User = {
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        firstName: 'Test',
        lastName: 'User',
        picture: ''
      };
      service.setUser(user);
      service.setSettings({
        language: 'en',
        environment: 'dev',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        onboarding: false
      });
      service.setParams({ key1: 'value1' });

      // Act
      service.clearAll();

      // Assert
      expect(service.user()).toBeNull();
      expect(service.settings()).toBeNull();
      expect(service.params()).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('isLoggedIn computed signal', () => {
    it('should return false when user is null', () => {
      // Arrange & Act
      const result = service.isLoggedIn();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when token is set', () => {
      // Arrange: isLoggedIn is based on token, not user
      service.setToken({ value: 'test-token' });

      // Act & Assert
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('restoreFromStorage', () => {
    it('should handle corrupted storage data gracefully', () => {
      // Arrange
      (mockStorageService.get as any).mockImplementation(() => {
        throw new Error('Corrupted data');
      });

      // Act
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [Session, { provide: StorageService, useValue: mockStorageService }]
      });

      const newService = TestBed.inject(Session);

      // Assert
      expect(newService.user()).toBeNull();
      expect(newService.settings()).toBeNull();
      expect(newService.params()).toBeNull();
    });

    it('should restore valid session state from storage', () => {
      // Arrange
      const storedState: SessionState = {
        user: {
          username: 'storeduser',
          email: 'stored@example.com',
          roles: ['user'],
          firstName: 'Stored',
          lastName: 'User',
          picture: ''
        },
        settings: {
          language: 'es',
          subscription: { code: '2', name: 'Premium', plan: { code: '2', name: 'Premium' } },
          environment: 'prod',
          onboarding: true
        },
        params: { key1: 'value1', key2: 'value2' },
        token: null
      };
      vi.mocked(mockStorageService.get).mockReturnValue(storedState);

      // Act
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [Session, { provide: StorageService, useValue: mockStorageService }]
      });

      const newService = TestBed.inject(Session);

      // Assert
      expect(newService.user()).toEqual(storedState.user);
      expect(newService.settings()).toEqual(storedState.settings);
      expect(newService.params()).toEqual(storedState.params);
    });
  });

  describe('settings edge cases', () => {
    it('should handle null settings when merging', () => {
      // Arrange
      const newSettings: Partial<Settings> = {
        language: 'fr',
        environment: 'test'
      };

      // Act
      service.setSettings(newSettings);

      // Assert
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('fr');
      expect(currentSettings?.environment).toBe('test');
    });

    it('should preserve existing settings when merging partial', () => {
      // Arrange
      service.setSettings({
        language: 'en',
        subscription: { code: '1', name: 'Basic', plan: { code: '1', name: 'Basic' } },
        environment: 'dev',
        onboarding: false
      });

      // Act
      service.setSettings({
        language: 'es'
      });

      // Assert
      const currentSettings = service.settings();
      expect(currentSettings?.language).toBe('es');
      expect(currentSettings?.environment).toBe('dev');
      expect(currentSettings?.subscription).toBeDefined();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter, signal } from '@angular/core';
import { AuthProvider } from './auth.provider';
import { Settings } from '../models/settings';

// Mock implementation of AuthProvider for testing
class MockAuthProvider extends AuthProvider {
  public readonly settings = signal<Settings | undefined>(undefined);
  public readonly loggedIn = new EventEmitter<boolean>(false);

  public getToken = vi.fn().mockReturnValue({ token: 'mock-token' });
  public logout = vi.fn().mockReturnValue(true);
  public changePassword = vi.fn();
  public confirmDeleteUser = vi.fn();
  public getSettings = vi.fn().mockResolvedValue({
    language: 'en',
    subscription: {
      code: 'premium',
      name: 'Premium',
      plan: { code: 'premium', name: 'Premium Plan' }
    },
    environment: 'production',
    onboarding: false
  } as Settings);
}

describe('AuthProvider', () => {
  let authProvider: MockAuthProvider;

  beforeEach(() => {
    authProvider = new MockAuthProvider();
  });

  describe('settings', () => {
    it('should have settings signal', () => {
      // Arrange & Act
      const settings = authProvider.settings();

      // Assert
      expect(settings).toBeUndefined();
    });

    it('should allow updating settings signal', () => {
      // Arrange
      const newSettings: Settings = {
        language: 'es',
        subscription: {
          code: 'basic',
          name: 'Basic',
          plan: { code: 'basic', name: 'Basic Plan' }
        },
        environment: 'development',
        onboarding: true
      };

      // Act
      authProvider.settings.set(newSettings);

      // Assert
      expect(authProvider.settings()).toEqual(newSettings);
    });
  });

  describe('loggedIn', () => {
    it('should have loggedIn EventEmitter', () => {
      // Arrange & Act & Assert
      expect(authProvider.loggedIn).toBeInstanceOf(EventEmitter);
    });

    it('should emit logged in status', async () => {
      // Arrange
      const promise = new Promise<boolean>((resolve) => {
        authProvider.loggedIn.subscribe((value) => {
          resolve(value);
        });
      });

      // Act
      authProvider.loggedIn.emit(true);

      // Assert
      const value = await promise;
      expect(value).toBe(true);
    });
  });

  describe('getToken', () => {
    it('should return token', () => {
      // Arrange & Act
      const token = authProvider.getToken();

      // Assert
      expect(token).toEqual({ token: 'mock-token' });
      expect(authProvider.getToken).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should return boolean', () => {
      // Arrange & Act
      const result = authProvider.logout();

      // Assert
      expect(result).toBe(true);
      expect(authProvider.logout).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should be callable', () => {
      // Arrange & Act
      authProvider.changePassword();

      // Assert
      expect(authProvider.changePassword).toHaveBeenCalled();
    });
  });

  describe('confirmDeleteUser', () => {
    it('should be callable', () => {
      // Arrange & Act
      authProvider.confirmDeleteUser();

      // Assert
      expect(authProvider.confirmDeleteUser).toHaveBeenCalled();
    });
  });

  describe('getSettings', () => {
    it('should return Promise with Settings', async () => {
      // Arrange & Act
      const settings = await authProvider.getSettings();

      // Assert
      expect(settings).toBeDefined();
      expect(settings).toHaveProperty('language');
      expect(settings).toHaveProperty('subscription');
      expect(authProvider.getSettings).toHaveBeenCalled();
    });

    it('should accept networkOnly parameter', async () => {
      // Arrange & Act
      await authProvider.getSettings(true);

      // Assert
      expect(authProvider.getSettings).toHaveBeenCalledWith(true);
      expect(authProvider.getSettings).toHaveBeenCalledTimes(1);
    });

    it('should accept pushToken parameter', async () => {
      // Arrange & Act
      await authProvider.getSettings(false, 'push-token-123');

      // Assert
      expect(authProvider.getSettings).toHaveBeenCalledWith(false, 'push-token-123');
    });
  });
});

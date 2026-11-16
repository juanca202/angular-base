import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { AuthProvider } from '@factor_ec/utils';

import { AnonymousAuthProvider } from '@/core/services/anonymous-auth-provider';

describe('AnonymousAuthProvider', () => {
  let provider: AuthProvider;

  beforeEach(() => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [{ provide: AuthProvider, useClass: AnonymousAuthProvider }],
    });
    provider = TestBed.inject(AuthProvider);
  });

  it('should have no user', () => {
    // Act & Assert
    expect(provider.user()).toBeNull();
  });

  it('should never be logged in', () => {
    // Act & Assert
    expect(provider.isLoggedIn()).toBe(false);
  });

  it('should not restore a session on init', async () => {
    // Act
    const result = await provider.init();

    // Assert
    expect(result).toBe(false);
  });

  it('should reject login attempts', async () => {
    // Act
    const result = await provider.login({ username: 'ada', password: 'secret' });

    // Assert
    expect(result).toBe(false);
    expect(provider.isLoggedIn()).toBe(false);
  });

  it('should resolve logout as already closed', async () => {
    // Act
    const result = await provider.logout();

    // Assert
    expect(result).toBe(true);
  });
});

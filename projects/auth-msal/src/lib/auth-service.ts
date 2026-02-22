import { Injectable, computed, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import type { AccountInfo } from '@azure/msal-browser';

import { AuthProvider, type Signup, type User } from 'auth-core';

function accountToUser(acc: AccountInfo | null): User | null {
  if (!acc) return null;
  return {
    username: acc.username,
    roles: ((acc.idTokenClaims as Record<string, unknown>)?.['roles'] as string[]) ?? []
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService extends AuthProvider {
  private readonly msal = inject(MsalService);

  override readonly user = computed(() => accountToUser(this.msal.instance.getActiveAccount()));

  override readonly isLoggedIn = computed(() => this.msal.instance.getActiveAccount() !== null);

  override login(): Promise<boolean> {
    this.msal.loginRedirect();
    return Promise.resolve(true);
  }

  override logout(): Promise<boolean> {
    this.msal.logoutRedirect();
    return Promise.resolve(true);
  }

  override connect(_client: 'google'): Promise<boolean> {
    this.msal.loginRedirect();
    return Promise.resolve(true);
  }

  override async signup(
    _data?: Signup | Record<string, unknown>,
    _options?: Record<string, unknown>
  ): Promise<unknown> {
    throw new Error('User registration is managed in Azure AD portal');
  }

  get account(): AccountInfo | null {
    return this.msal.instance.getActiveAccount();
  }

  changePassword(): void {
    // Con MSAL/Azure AD, el cambio de contraseña se gestiona en el portal de Microsoft
    this.msal.loginRedirect();
  }
}

import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import type { AccountInfo } from '@azure/msal-browser';

import { AuthProvider, type User } from 'auth-core';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AuthProvider {
  private readonly msal = inject(MsalService);

  override login(): Promise<boolean> {
    this.msal.loginRedirect();
    return Promise.resolve(true);
  }

  override logout(): Promise<boolean> {
    this.msal.logoutRedirect();
    return Promise.resolve(true);
  }

  override getUser(): User {
    const acc = this.msal.instance.getActiveAccount();
    if (!acc) {
      return {
        username: '',
        email: '',
        roles: [],
        firstName: '',
        lastName: '',
        picture: ''
      };
    }
    return {
      username: acc.username,
      email: (acc.idTokenClaims as Record<string, unknown>)?.['email'] as string ?? acc.username,
      roles: (acc.idTokenClaims as Record<string, unknown>)?.['roles'] as string[] ?? [],
      firstName: (acc.idTokenClaims as Record<string, unknown>)?.['given_name'] as string ?? '',
      lastName: (acc.idTokenClaims as Record<string, unknown>)?.['family_name'] as string ?? '',
      picture: (acc.idTokenClaims as Record<string, unknown>)?.['picture'] as string ?? ''
    };
  }

  override isLoggedIn(): boolean {
    return this.msal.instance.getActiveAccount() !== null;
  }

  get account(): AccountInfo | null {
    return this.msal.instance.getActiveAccount();
  }

  changePassword(): void {
    // Con MSAL/Azure AD, el cambio de contraseña se gestiona en el portal de Microsoft
    this.msal.loginRedirect();
  }
}

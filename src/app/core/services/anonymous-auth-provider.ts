import { Injectable, signal } from '@angular/core';

import { AuthProvider, type User } from '@factor_ec/utils';

/**
 * Default {@link AuthProvider} for applications that do not have authentication yet.
 *
 * @remarks
 * It represents a permanently anonymous visitor: there is never a user, the
 * session is never considered active, and `login`/`logout` do nothing. It lets
 * the base project run without assuming an identity provider. When the
 * application adopts real authentication, replace the binding in
 * `app.config.ts` (e.g. `{ provide: AuthProvider, useClass: AuthService }`).
 */
@Injectable()
export class AnonymousAuthProvider extends AuthProvider {
  public readonly user = signal<User | null>(null).asReadonly();

  /** Resolves to `false`: there is no session to restore. */
  public async init(): Promise<boolean> {
    return false;
  }

  /** Resolves to `false`: anonymous visitors cannot sign in. */
  public async login(): Promise<boolean> {
    return false;
  }

  /** Resolves to `true`: there is no session to close, so it is always closed. */
  public async logout(): Promise<boolean> {
    return true;
  }

  /** Always `false`: an anonymous visitor is never logged in. */
  public isLoggedIn(): boolean {
    return false;
  }
}

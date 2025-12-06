import { EventEmitter, InjectionToken, Signal } from '@angular/core';

import { Settings } from 'app/core/models/settings';

export interface AuthContext {
  readonly settings: Signal<Settings | undefined>;
  getToken(): unknown;
  logout(): boolean;
  changePassword(): void;
  confirmDeleteUser(): void;
  getSettings(networkOnly?: boolean, pushToken?: string): Promise<Settings | false>;
  readonly loggedIn: EventEmitter<boolean>;
}

export const AUTH_CONTEXT = new InjectionToken<AuthContext>('AUTH_CONTEXT');

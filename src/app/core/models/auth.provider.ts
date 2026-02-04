import { EventEmitter, Signal } from '@angular/core';

import { Settings } from '@/core/models/settings';

export abstract class AuthProvider {
  public abstract readonly settings: Signal<Settings | undefined>;
  public abstract readonly loggedIn: EventEmitter<boolean>;

  public abstract getToken(): unknown;
  public abstract logout(): boolean;
  public abstract changePassword(): void;
  public abstract confirmDeleteUser(): void;
  public abstract getSettings(networkOnly?: boolean, pushToken?: string): Promise<Settings | false>;
}

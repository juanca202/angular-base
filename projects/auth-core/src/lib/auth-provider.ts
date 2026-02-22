import { User } from './models/user';
import { Login } from './models/login';
import type { Signup } from './models/signup';
import { Signal } from '@angular/core';

export abstract class AuthProvider {
  public abstract user: Signal<User | null>;
  public abstract login(data?: Login): Promise<boolean>;
  public abstract logout(): Promise<boolean>;
  public abstract isLoggedIn: Signal<boolean>;

  /** Optional: federated login (e.g. Google). Implementations may redirect or no-op. */
  public abstract connect?(client: 'google'): Promise<boolean>;

  /** Optional: user registration. Implementations may throw if not supported. */
  public abstract signup?(
    data: Signup | Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<unknown>;
}

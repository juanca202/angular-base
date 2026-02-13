import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { CustomParams, SessionState, SessionToken } from '@/core/models/session-state';
import { User } from '@/core/models/user';
import { Settings } from '@/core/models/settings';
import { StorageService } from '@factor_ec/utils';

/** Storage key prefix for session data persisted in local storage */
const STORAGE_KEY = `${environment.sessionPrefix}_sess`;
/** Session token key */
const TOKEN_KEY = `${environment.sessionPrefix}_sess`;

/**
 * Service for managing user session state including user information, settings, and custom parameters.
 *
 * This service provides reactive access to session data using Angular signals and computed properties.
 * It persists user, settings and params to local storage. The session token is stored in a Secure
 * cookie from the client (Secure; SameSite=Strict). Note: cookies set from JavaScript cannot be
 * HttpOnly; for maximum security the backend could set an HttpOnly cookie instead.
 *
 * @example
 * ```typescript
 * const session = inject(Session);
 *
 * // Set user
 * session.setUser(userData);
 *
 * // Access reactive user data
 * const currentUser = session.user();
 * const isLogged = session.isLoggedIn();
 * ```
 *
 * @since 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export class Session {
  /** @internal Service for managing browser storage operations */
  private readonly storageService = inject(StorageService);

  /**
   * @internal
   * Señales separadas por campo para que cambios en uno no re-ejecuten computeds de otros
   * (p. ej. setUser solo afecta a user(), no a settings(), token(), isLoggedIn()).
   */
  private readonly _token = signal<SessionToken | null>(null);
  private readonly _user = signal<User | null>(null);
  private readonly _params = signal<CustomParams | null>(null);
  private readonly _settings = signal<Settings | null>(null);

  /** Token */
  public readonly token = computed(() => this._token());

  /**
   * Computed signal indicating whether a user is currently logged in
   * Based on the presence and validity of the authentication token
   *
   * For JWT tokens, validates expiration. For other token types, only checks existence.
   *
   * @returns true if a valid token exists, false otherwise
   */
  public readonly isLoggedIn = computed(() => {
    const token = this._token();
    if (!token || !token.value) return false;

    if (token.expiresAt) {
      const currentTimestamp = Math.round(Date.now() / 1000);
      return token.expiresAt > currentTimestamp;
    }
    return true;
  });

  /** User */
  public readonly user = computed(() => this._user());

  /** Params */
  public readonly params = computed(() => this._params());

  /** Settings */
  public readonly settings = computed(() => this._settings());

  /**
   * Initializes the session service and sets up automatic persistence
   */
  constructor() {
    this.restoreFromStorage();

    // Effect: persist only user, settings, params (token is stored in cookie from setToken/clearToken)
    effect(() => {
      const state: SessionState = {
        user: this._user(),
        settings: this._settings(),
        params: this._params(),
        token: null
      };
      this.storageService.set(STORAGE_KEY, state, 'local');
    });
  }

  /**
   * Restores session state from local storage and from the token cookie.
   *
   * @internal
   */
  private restoreFromStorage(): void {
    try {
      const session = this.storageService.get(STORAGE_KEY, 'local');
      if (session) {
        const s = session as SessionState;
        this._user.set(s.user ?? null);
        this._settings.set(s.settings ?? null);
        this._params.set(s.params ?? null);
      }
      const token = this.getToken();
      if (token) this._token.set(token);
    } catch {
      this.clearAll();
    }
  }

  /**
   * Reads the session token from the Secure cookie (client-side storage).
   * @internal
   */
  private getToken(): SessionToken | null {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + TOKEN_KEY.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)')
    );
    const raw = match ? decodeURIComponent(match[1]) : null;
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as SessionToken;
      return data?.value ? data : null;
    } catch {
      return null;
    }
  }

  /**
   * Sets the authentication token in session state and in a Secure cookie (client-side).
   * Cookie: Path=/; SameSite=Strict; Secure on HTTPS; Max-Age from expiresAt or 1 day.
   *
   * @param token - The authentication token object to store
   */
  public setToken(token: SessionToken | null): void {
    if (!token?.value?.trim()) {
      this.clearToken();
      return;
    }
    const copy = { ...token };
    this._token.set(copy);
    if (typeof document !== 'undefined') {
      const value = encodeURIComponent(JSON.stringify(copy));
      const maxAge = copy.expiresAt
        ? Math.max(0, copy.expiresAt - Math.round(Date.now() / 1000))
        : 24 * 60 * 60;
      let cookie = `${TOKEN_KEY}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Strict`;
      if (typeof location !== 'undefined' && location.protocol === 'https:') cookie += '; Secure';
      document.cookie = cookie;
    }
  }

  /**
   * Clears the authentication token from session state and removes the cookie.
   */
  public clearToken(): void {
    this._token.set(null);
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0`;
    }
  }

  /**
   * Sets the current user in session state
   *
   * @param user - The user object to store in session
   */
  public setUser(user: User): void {
    this._user.set(user);
  }

  /**
   * Clears the current user from session state
   */
  public clearUser(): void {
    this._user.set(null);
  }

  /**
   * Sets a single custom parameter in session state
   *
   * @param key - The parameter key
   * @param value - The parameter value
   */
  public setParam(key: string, value: any): void {
    this._params.update((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Merges multiple custom parameters into session state
   *
   * @param values - Object containing key-value pairs to merge
   */
  public setParams(values: Record<string, any>): void {
    this._params.update((prev) => ({ ...prev, ...values }));
  }

  /**
   * Clears all custom parameters from session state
   */
  public clearParams(): void {
    this._params.set(null);
  }

  /**
   * Merges provided settings with existing settings in session state
   *
   * @param settings - Partial settings object to merge with existing settings
   */
  public setSettings(settings: Partial<Settings>): void {
    this._settings.update((prev) => ({ ...(prev ?? {}), ...settings }) as Settings);
  }

  /**
   * Clears all settings from session state
   */
  public clearSettings(): void {
    this._settings.set(null);
  }

  /**
   * Clears all session data (user, settings, parameters, and token) and removes data from storage
   */
  public clearAll(): void {
    this.clearUser();
    this.clearSettings();
    this.clearParams();
    this.clearToken();
    this.storageService.delete(STORAGE_KEY, 'local');
  }
}

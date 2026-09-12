import { Service, signal, computed, effect, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { CustomParams, SessionState } from '@/core/models/session-state';
import { Settings } from '@/core/models/settings';
import { Storage } from '@factor_ec/utils';
import { AuthProvider } from '@factor_ec/utils';
import { lastValueFrom, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from '@/core/utils/async-resources';

/** Storage key prefix for session data persisted in local storage */
const STORAGE_KEY = `${environment.sessionPrefix}_sess`;

/**
 * Service for managing session state: settings and custom parameters.
 *
 * Provides reactive access via signals and computed properties. Persists settings
 * and params to local storage. User and token are managed by the AuthProvider (e.g. MSAL).
 *
 * @example
 * ```typescript
 * const session = inject(Session);
 *
 * // Set settings
 * session.setSettings({ theme: 'dark' });
 *
 * // Reactive access
 * const currentSettings = session.settings();
 * session.setParam('key', value);
 * ```
 *
 * @since 1.0.0
 */
@Service()
export class Session {
  // Dependency injection
  private readonly authProvider = inject(AuthProvider);
  private readonly httpClient = inject(HttpClient);
  private readonly storage = inject(Storage);

  /**
   * @internal
   * Separate signals per field so changes in one do not re-run computeds of others
   * (e.g. setSettings only affects settings(), not params()).
   */
  private readonly _params = signal<CustomParams | null>(null);
  private readonly _settings = signal<Settings | null>(null);

  /** Custom parameters persisted in session (read-only computed) */
  public readonly params = computed(() => this._params());

  /** Application settings persisted in session (read-only computed) */
  public readonly settings = computed(() => this._settings());

  /**
   * Initializes the session service and sets up automatic persistence
   */
  constructor() {
    this.restoreFromStorage();

    // Effect: persist settings and params to local storage
    effect(() => {
      const state: SessionState = {
        settings: this._settings(),
        params: this._params()
      };
      this.storage.set(STORAGE_KEY, state, 'local');
    });
  }

  /**
   * Restores session state from local storage and from the token cookie.
   *
   * @internal
   */
  private restoreFromStorage(): void {
    try {
      const session = this.storage.get(STORAGE_KEY, 'local');
      if (session) {
        const s = session as SessionState;
        this._settings.set(s.settings ?? null);
        this._params.set(s.params ?? null);
      }
    } catch {
      this.clearAll();
    }
  }

  public async getSettings(networkOnly?: boolean, pushToken?: string): Promise<Settings | false> {
    // Get remote configuration
    let headers = {};
    if (pushToken) {
      headers = {
        'Push-Token': pushToken
      };
    }
    const settings = this.settings();
    const user = this.authProvider.user();
    const networkSettings = lastValueFrom<Settings>(
      this.httpClient
        .get<Settings>(getApiUrl('settings'), {
          headers
        })
        .pipe(
          tap((response: Settings) => {
            this.setSettings(response);
          })
        )
    );
    if (networkOnly || !user || !settings) {
      return networkSettings;
    }
    // Get local configuration
    if (user && settings) {
      return settings;
    }
    // If configuration cannot be obtained, the user must re-authenticate
    this.authProvider.logout();
    return false;
  }

  /**
   * Merges provided settings with existing settings in session state
   *
   * @param settings - Partial settings object to merge with existing settings
   */
  private setSettings(settings: Partial<Settings>): void {
    this._settings.update(() => ({ ...settings }) as Settings);
  }

  /**
   * Clears all settings from session state
   */
  public clearSettings(): void {
    this._settings.set(null);
  }

  /**
   * Sets a single custom parameter in session state
   *
   * @param key - The parameter key
   * @param value - The parameter value
   */
  public setParam(key: string, value: unknown): void {
    this._params.update((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Merges multiple custom parameters into session state
   *
   * @param values - Object containing key-value pairs to merge
   */
  public setParams(values: Record<string, unknown>): void {
    this._params.update((prev) => ({ ...prev, ...values }));
  }

  /**
   * Clears all custom parameters from session state
   */
  public clearParams(): void {
    this._params.set(null);
  }

  /**
   * Clears all session data (settings, parameters) and removes data from storage.
   */
  public clearAll(): void {
    this.clearSettings();
    this.clearParams();
    this.storage.delete(STORAGE_KEY, 'local');
  }
}

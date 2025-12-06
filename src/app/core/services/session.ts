import { Injectable, signal, computed, effect, inject, EventEmitter } from '@angular/core';
import { environment } from '@/environments/environment';
import { SessionState } from '../models/session-state';
import { User } from '../models/user';
import { Settings } from '../models/settings';
import { StorageService } from '@factor_ec/utils';

/** Storage key prefix for session data persisted in local storage */
const STORAGE_KEY = `${environment.sessionPrefix}_sess`;

/**
 * Service for managing user session state including user information, settings, and custom parameters.
 *
 * This service provides reactive access to session data using Angular signals and computed properties.
 * It automatically persists session changes to local storage and restores them on application initialization.
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
   * Reactive signal holding the complete session state including user, settings, and custom parameters
   */
  private readonly _state = signal<SessionState>({
    user: null,
    settings: null,
    params: {}
  });

  /**
   * Computed signal providing reactive access to the current logged-in user
   *
   * @returns The current user object or null if not authenticated
   */
  public readonly user = computed(() => this._state().user);

  /**
   * Computed signal providing reactive access to user settings
   *
   * @returns The user settings object or null if not set
   */
  public readonly settings = computed(() => this._state().settings);

  /**
   * Computed signal providing reactive access to custom session parameters
   *
   * @returns Object containing custom key-value parameters
   */
  public readonly params = computed(() => this._state().params);

  /**
   * Computed signal indicating whether a user is currently logged in
   *
   * @returns true if a user is logged in, false otherwise
   */
  public readonly isLoggedIn = computed(() => !!this._state().user);

  private previousUser: User | null = null;

  public readonly loggedIn = new EventEmitter<User>();
  public readonly loggedOut = new EventEmitter<void>();

  /**
   * Initializes the session service and sets up automatic persistence
   */
  constructor() {
    this.restoreFromStorage();

    // Effect to automatically persist each state change
    effect(() => {
      const state = this._state();
      this.storageService.set(STORAGE_KEY, state);
    });

    effect(() => {
      const currentUser = this._state().user;
      if (!this.previousUser && currentUser) {
        this.loggedIn.emit(currentUser);
      }
      if (this.previousUser && !currentUser) {
        this.loggedOut.emit();
      }
      this.previousUser = currentUser;
    });
  }

  /**
   * Restores session state from local storage
   *
   * If stored data is invalid or corrupted, clears all session data
   *
   * @internal
   */
  private restoreFromStorage(): void {
    try {
      const session = this.storageService.get(STORAGE_KEY, 'local');
      if (!session) return;
      this._state.set(session as SessionState);
    } catch {
      this.clearAll();
    }
  }

  /**
   * Sets the current user in session state
   *
   * @param user - The user object to store in session
   */
  public setUser(user: User): void {
    this._state.update((prev) => ({ ...prev, user }));
  }

  /**
   * Clears the current user from session state
   */
  public clearUser(): void {
    this._state.update((prev) => ({ ...prev, user: null }));
  }

  /**
   * Merges provided settings with existing settings in session state
   *
   * @param settings - Partial settings object to merge with existing settings
   */
  public setSettings(settings: Partial<Settings>): void {
    this._state.update((prev) => {
      const merged = { ...(prev.settings ?? {}), ...settings } as Settings;
      return { ...prev, settings: merged };
    });
  }

  /**
   * Clears all settings from session state
   */
  public clearSettings(): void {
    this._state.update((prev) => ({ ...prev, settings: null }));
  }

  /**
   * Sets a single custom parameter in session state
   *
   * @param key - The parameter key
   * @param value - The parameter value
   */
  public setParam(key: string, value: any): void {
    this._state.update((prev) => ({
      ...prev,
      params: { ...prev.params, [key]: value }
    }));
  }

  /**
   * Merges multiple custom parameters into session state
   *
   * @param values - Object containing key-value pairs to merge
   */
  public setParams(values: Record<string, any>): void {
    this._state.update((prev) => ({
      ...prev,
      params: { ...prev.params, ...values }
    }));
  }

  /**
   * Clears all custom parameters from session state
   */
  public clearParams(): void {
    this._state.update((prev) => ({ ...prev, params: {} }));
  }

  /**
   * Clears all session data (user, settings, and parameters) and removes data from storage
   */
  public clearAll(): void {
    this._state.set({
      user: null,
      settings: null,
      params: {}
    });
    this.storageService.delete(STORAGE_KEY);
  }
}

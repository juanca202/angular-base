import {
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders,
  HttpHandlerFn,
  HttpClient
} from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  BehaviorSubject,
  Observable,
  switchMap,
  throwError,
  catchError,
  share,
  finalize,
  filter,
  take,
  tap,
  lastValueFrom
} from 'rxjs';

import { AUTH_CONFIG } from './auth-config.token';
import { FedcmCredentialRequestOptions, FedcmCredential } from './models/fedcm-credential';
import { AuthProvider } from './auth-provider';
import { Login } from './models/login';
import { AuthToken } from './models/auth-token';
import { User } from './models/user';
import type { Signup } from './models/signup';

declare let navigator: Navigator & {
  userAgentData?: { brands: { brand: string }[] };
  credentials?: { get?: (options?: unknown) => Promise<Credential | null> };
};

/**
 * Concrete authentication provider responsible for handling session lifecycle,
 * secure token refresh, and profile management concerns across the app.
 *
 * @remarks
 * The service extends {@link AuthProvider} to leverage core session helpers while
 * adding stateful logic for dialogs, social login, and settings synchronization.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService extends AuthProvider {
  // Dependency injection
  private readonly config = inject(AUTH_CONFIG);
  private readonly dialog = inject(MatDialog);
  private readonly httpClient = inject(HttpClient);
  private readonly _user = signal<User | null>(null);

  /** Session token key */
  private readonly TOKEN_KEY = `${this.config.sessionPrefix}_sess`;

  public readonly user = computed(() => this._user());

  constructor() {
    super();
    if (this.isLoggedIn()) {
      this._user.set(this.extractUserFromToken(this.getToken()?.token ?? ''));
    }
  }

  /**
   * Flag indicating whether the access token is being refreshed
   */
  public refreshTokenInProgress = false;
  /**
   * Manages the access token refresh flow
   */
  private readonly refreshTokenSubject = new BehaviorSubject<AuthToken | null>(null);

  /**
   * Sends the authentication token to the server
   * @param request HTTP request
   * @returns
   */
  public addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    const token: AuthToken | null = this.getToken();

    // If the access token is null, the user is not logged in; return the original request
    if (
      !token ||
      request.url.includes(this.config.auth.signinUrl) ||
      (this.config.auth.refreshTokenUrl && request.url.includes(this.config.auth.refreshTokenUrl))
    ) {
      return request;
    }

    // Clone the request, because the original request is immutable
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token.token}`
      }
    });
  }
  public async connect(client: 'google'): Promise<boolean> {
    const isChrome =
      navigator.userAgentData?.brands?.some((b) => b.brand === 'Google Chrome') ?? false;

    if (
      this.config.fedcm &&
      isChrome &&
      'credentials' in navigator &&
      navigator.credentials &&
      'get' in navigator.credentials
    ) {
      try {
        const fedcm = this.config.fedcm[client];
        if (!fedcm) {
          throw new Error('No auth client exists');
        }
        const credential = await navigator.credentials.get({
          identity: {
            mode: 'active',
            providers: [
              {
                configURL: fedcm.configURL,
                clientId: fedcm.clientId,
                fields: ['name', 'email', 'picture'],
                params: {
                  fetch_basic_profile: true,
                  response_type: 'permission id_token',
                  scope: 'email profile openid',
                  include_granted_scopes: true,
                  nonce: 'notprovided'
                }
              }
            ]
          },
          mediation: 'required'
        } as FedcmCredentialRequestOptions);
        if (!credential) {
          throw new Error('No credential obtained');
        }
        const fedcmCredential = credential as unknown as FedcmCredential;
        // Send the ID token to the backend
        const response = await fetch(fedcm.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_token: JSON.parse(fedcmCredential.token).id_token
          })
        });
        const data = await response.json();
        this.setToken(data.token);
        this._user.set(data.user);
        location.href = this.config.appPath;
      } catch (e) {
        console.error('FedCM error: ', e);
        return false;
      }
    } else {
      const url = this.config.auth.clients[client];
      if (url) {
        location.href = url;
      }
    }
    return true;
  }

  /**
   * Extracts user claims from a JWT token payload.
   * Maps common JWT claims (sub, email, given_name, family_name, etc.) to the User model.
   * @param jwtToken The JWT token string
   * @returns User object or null if parsing fails
   */
  private extractUserFromToken(jwtToken: string): User | null {
    if (!jwtToken) return null;
    try {
      const jwtParts = jwtToken.split('.');
      if (jwtParts.length !== 3) return null;
      const payload = JSON.parse(window.atob(jwtParts[1])) as Record<string, unknown>;
      const roles = Array.isArray(payload['roles'])
        ? (payload['roles'] as string[])
        : typeof payload['role'] === 'string'
          ? [payload['role']]
          : [];
      return {
        username: (payload['sub'] ??
          payload['preferred_username'] ??
          payload['username'] ??
          '') as string,
        roles
      };
    } catch {
      return null;
    }
  }

  /**
   * Extracts the expiration timestamp from a JWT token
   * @param jwtToken The JWT token string
   * @returns The expiration timestamp in seconds (JWT exp format) or undefined if not found/invalid
   */
  private extractExpirationFromToken(jwtToken: string): number | undefined {
    if (!jwtToken) {
      return undefined;
    }

    try {
      const jwtParts = jwtToken.split('.');
      if (jwtParts.length === 3) {
        const payload = JSON.parse(window.atob(jwtParts[1]));
        if (payload.exp) {
          // Store timestamp in seconds (JWT exp format)
          return payload.exp;
        }
      }
    } catch {
      // If JWT parsing fails, return undefined
    }

    return undefined;
  }
  /**
   * Handles the flow of refreshing the access token or redirecting to sign-in
   * @param err HTTP error
   * @param request HTTP request sent
   * @param next HTTP handler
   */
  public handle401Error(
    err: HttpErrorResponse,
    request: HttpRequest<any>,
    next: HttpHandlerFn
  ): Observable<any> {
    const token: AuthToken | null = this.getToken();
    if (token && token.refresh_token && this.config.auth.refreshTokenUrl) {
      if (!this.refreshTokenInProgress) {
        this.refreshTokenInProgress = true;
        this.refreshTokenSubject.next(null);
        return this.refreshToken().pipe(
          switchMap((newToken: AuthToken) => {
            if (newToken) {
              this.refreshTokenSubject.next(newToken);
              return next(this.addAuthenticationToken(request));
            }
            // If we don't get a new token, logout.
            this.logout();
            return throwError(
              () =>
                new HttpErrorResponse({
                  error: {},
                  headers: new HttpHeaders(),
                  status: 401,
                  statusText: '',
                  url: undefined
                })
            );
          }),
          catchError((error) => {
            // It can't replace the access token; set error status 401 to continue flow
            return throwError(
              () =>
                new HttpErrorResponse({
                  error: error.error,
                  headers: error.headers,
                  status: 401,
                  statusText: error.statusText,
                  url: error.url || undefined
                })
            );
          }),
          share(),
          finalize(() => {
            this.refreshTokenInProgress = false;
          })
        );
      } else {
        return this.refreshTokenSubject.pipe(
          filter((token) => token != null),
          take(1),
          switchMap(() => {
            return next(this.addAuthenticationToken(request));
          })
        );
      }
    } else {
      // No refresh token flow
      if (this.isLoggedIn()) {
        this.logout();
      }
      return throwError(() => err);
    }
  }

  /**
   * Sends sign-in to the server and obtains the authentication token
   * @param data Authentication data
   * @returns
   */
  public async login(data?: Login): Promise<boolean> {
    const token = await lastValueFrom(
      this.httpClient.post<AuthToken>(this.config.auth.signinUrl, data)
    );
    this.setToken(token);
    return true;
  }
  /**
   * Logs out the user
   */
  public async logout(): Promise<boolean> {
    this.dialog.closeAll();
    this.clearToken();
    this.clearUser();
    location.href =
      window.innerWidth < 1000 ? `${this.config.appPath}/auth` : `${this.config.appPath}/signin`;
    return true;
  }
  public async signup(
    data: Signup | Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<unknown> {
    return lastValueFrom(this.httpClient.post(this.config.auth.signupUrl, data, options));
  }
  /**
   * If a refresh token is implemented, send it to obtain a new access token
   * @returns Access token
   */
  public refreshToken(): Observable<AuthToken> {
    const token = this.getToken();
    return this.httpClient
      .post<AuthToken>(this.config.auth.refreshTokenUrl, { refresh_token: token?.refresh_token })
      .pipe(
        tap((token: AuthToken) => {
          this.setToken(token);
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => new Error(error));
        })
      );
  }

  /**
   * Reads the session token from the Secure cookie (client-side storage).
   * @internal
   */
  private getToken(): AuthToken | null {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + this.TOKEN_KEY.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)')
    );
    const raw = match ? decodeURIComponent(match[1]) : null;
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as AuthToken;
      return data?.token ? data : null;
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
  private setToken(token: AuthToken | null): void {
    const copy: AuthToken | null = token ? { ...token } : null;
    if (copy && typeof document !== 'undefined') {
      const expiresAt = this.extractExpirationFromToken(copy.token);
      const value = encodeURIComponent(JSON.stringify(copy));
      const maxAge = expiresAt
        ? Math.max(0, expiresAt - Math.round(Date.now() / 1000))
        : 24 * 60 * 60;
      let cookie = `${this.TOKEN_KEY}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Strict`;
      if (typeof location !== 'undefined' && location.protocol === 'https:') cookie += '; Secure';
      document.cookie = cookie;
      this._user.set(this.extractUserFromToken(copy.token) ?? null);
    }
  }

  /**
   * Clears the authentication token from session state and removes the cookie.
   */
  public clearToken(): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${this.TOKEN_KEY}=; Path=/; Max-Age=0`;
    }
    this.clearUser();
  }

  /**
   * Clears the current user from session state
   */
  public clearUser(): void {
    this._user.set(null);
  }

  /**
   * Computed signal indicating whether a user is currently logged in
   * Based on the presence and validity of the authentication token
   *
   * For JWT tokens, validates expiration. For other token types, only checks existence.
   *
   * @returns true if a valid token exists, false otherwise
   */
  public readonly isLoggedIn = computed(() => {
    // Depend on _user so computed re-evaluates when setToken/clearToken updates state
    this._user();
    const token = this.getToken();
    if (!token) return false;

    const expiresAt = this.extractExpirationFromToken(token.token);
    if (expiresAt) {
      const currentTimestamp = Math.round(Date.now() / 1000);
      return expiresAt > currentTimestamp;
    }
    return true;
  });
}

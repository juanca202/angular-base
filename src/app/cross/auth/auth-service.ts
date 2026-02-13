import { HttpRequest, HttpErrorResponse, HttpHeaders, HttpHandlerFn } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Login } from '@/cross/auth/models/login';
import { Settings } from '@/core/models/settings';
import { AuthProvider } from '@/core/models/auth.provider';
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

import { environment } from '@/environments/environment';
import { DeleteUser } from '@/cross/auth/components/delete-user/delete-user';
import { ChangePassword } from '@/cross/auth/components/change-password/change-password';
import { getApiUrl } from '@/core/utils/async-resources';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { registerMockAuthRoutes } from '@/test/mocks/mock-auth-routes';
import { Session } from '@/core/services/session';
import { SessionToken } from '@/core/models/session-state';
import { AuthToken } from './models/auth-token';

interface FedcmCredentialRequestOptions extends CredentialRequestOptions {
  identity: {
    providers: {
      configURL: string;
      clientId: string;
      fields: string[];
      params: any;
      nonce: string;
    }[];
    mode: string;
  };
}

interface FedcmCredential {
  token: string;
  // ... other properties if any
}

declare let navigator: any;

/**
 * Session variables:
 * [PREFIX]_loc = locale
 * [PREFIX]_cid = client ID
 * [PREFIX]_lus = last user
 *
 * [PREFIX]_jwt = session token
 * [PREFIX]_set = user settings
 * [PREFIX]_rdi = redirect url
 * [PREFIX]_cur = default currency
 * [PREFIX]_dce = delete code expires at
 */
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
  private readonly dialog = inject(MatDialog);
  // TODO: Replace with HttpClient when using real backend
  private readonly httpClient = inject(MockHttpClient);
  private readonly session = inject(Session);

  constructor() {
    super();
    registerMockAuthRoutes(this.httpClient);
  }

  /**
   * Flag indicating whether the access token is being refreshed
   */
  public refreshTokenInProgress = false;
  /**
   * Manages the access token refresh flow
   */
  private readonly refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Sends the authentication token to the server
   * @param request HTTP request
   * @returns
   */
  public addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    const token: SessionToken | null = this.session.token();

    // If the access token is null, the user is not logged in; return the original request
    if (
      !token ||
      request.url.includes(environment.auth.signinUrl) ||
      (environment.auth.refreshTokenUrl && request.url.includes(environment.auth.refreshTokenUrl))
    ) {
      return request;
    }

    // Clone the request, because the original request is immutable
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token.value}`
      }
    });
  }
  public changePassword(): void {
    this.dialog.open(ChangePassword, {
      panelClass: 'ft-dialog',
      width: '400px'
    });
  }
  public async connect(client: 'google'): Promise<boolean> {
    const isChrome = navigator.userAgentData.brands.some((b: any) => b.brand === 'Google Chrome');

    if (
      environment.fedcm &&
      isChrome &&
      'credentials' in navigator &&
      'get' in navigator.credentials
    ) {
      try {
        const fedcm = environment.fedcm[client];
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
        const expiresAt = this.extractExpirationFromToken(data.token);
        this.session.setToken({ value: data.token, type: 'jwt', expiresAt });
        this.session.setParams({ refreshToken: data.refresh_token });
        this.session.setUser(data.user);
        location.href = environment.appPath;
      } catch (e) {
        console.error('FedCM error: ', e);
        return false;
      }
    } else {
      const url = environment.auth.clients[client];
      if (url) {
        location.href = url;
      }
    }
    return true;
  }
  public confirmDeleteUser(): void {
    this.dialog.open(DeleteUser, {
      panelClass: 'ft-dialog',
      width: '400px'
    });
  }

  /**
   * Extracts the expiration timestamp from a JWT token
   * @param tokenString The JWT token string
   * @returns The expiration timestamp in seconds (JWT exp format) or undefined if not found/invalid
   */
  private extractExpirationFromToken(tokenString: string): number | undefined {
    if (!tokenString || environment.auth.tokenType !== 'jwt') {
      return undefined;
    }

    try {
      const jwtParts = tokenString.split('.');
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
  public async getSettings(networkOnly?: boolean, pushToken?: string): Promise<Settings | false> {
    // Get remote configuration
    let headers = {};
    if (pushToken) {
      headers = {
        'Push-Token': pushToken
      };
    }
    const settings = this.session.settings();
    const user = this.session.user();
    const networkSettings = lastValueFrom<Settings>(
      this.httpClient
        .get<Settings>(getApiUrl('settings'), {
          headers
        })
        .pipe(
          tap((response: any) => {
            this.session.setUser(response.user);
            this.session.setSettings(response);
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
    this.logout();
    return false;
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
    const token: SessionToken | null = this.session.token();
    const params = this.session.params();
    if (token && params && params['refreshToken'] && environment.auth.refreshTokenUrl) {
      if (!this.refreshTokenInProgress) {
        this.refreshTokenInProgress = true;
        this.refreshTokenSubject.next(null);
        return this.refreshToken().pipe(
          switchMap((newToken: SessionToken) => {
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
      if (this.session.isLoggedIn()) {
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
  public async signin(data: Login): Promise<boolean> {
    const token = await lastValueFrom<AuthToken>(
      this.httpClient.post<AuthToken>(environment.auth.signinUrl, data)
    );

    const expiresAt = this.extractExpirationFromToken(token.token);
    this.session.setToken({ value: token.token, type: 'jwt', expiresAt });
    this.session.setParams({ refreshToken: token.refresh_token });
    return true;
  }
  /**
   * Logs out the user
   */
  public logout(): boolean {
    this.dialog.closeAll();
    this.session.clearAll();
    location.href =
      window.innerWidth < 1000 ? `${environment.appPath}/auth` : `${environment.appPath}/signin`;
    return true;
  }
  public signup(data: any, options?: any): Promise<unknown> {
    return lastValueFrom(this.httpClient.post(environment.auth.signupUrl, data, options));
  }
  /**
   * If a refresh token is implemented, send it to obtain a new access token
   * @returns Access token
   */
  public refreshToken(): Observable<SessionToken> {
    const params = this.session.params();
    return this.httpClient
      .post(environment.auth.refreshTokenUrl, { refresh_token: params?.['refreshToken'] })
      .pipe(
        tap((tokenResponse: any) => {
          const expiresAt = this.extractExpirationFromToken(
            tokenResponse.value || tokenResponse.token
          );
          this.session.setToken({
            value: tokenResponse.value || tokenResponse.token,
            type: tokenResponse.type || 'jwt',
            expiresAt
          });
        }),
        catchError((error) => {
          this.logout();
          return throwError(error);
        })
      );
  }
}

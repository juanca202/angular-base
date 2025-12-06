import {
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders,
  HttpHandlerFn,
  HttpClient
} from '@angular/common/http';
import { EventEmitter, Injectable, signal, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { StorageService } from '@factor_ec/utils';
// import * as Sentry from '@sentry/angular';

import { Login } from 'app/auth/models/login';
import { AuthToken } from 'app/auth/models/auth-token';
import { AuthTokenPayload } from 'app/auth/models/auth-token-payload';
import { Settings } from 'app/core/models/settings';
import { AuthProvider } from 'app/core/services/auth.provider';
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

import { environment } from 'environments/environment';
import { DeleteUser } from 'app/auth/components/delete-user/delete-user';
import { ChangePassword } from 'app/auth/components/change-password/change-password';
import { getApiUrl } from 'app/core/utils/async-repository';

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
@Injectable({
  providedIn: 'root'
})
export class AuthService extends AuthProvider {
  private readonly dialog = inject(MatDialog);
  private readonly httpClient = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  constructor() {
    super();
  }

  public readonly signedIn = new EventEmitter<boolean>(false);
  public readonly signedUp = new EventEmitter<boolean>(false);
  public readonly loggedIn = new EventEmitter<boolean>(false);
  public readonly settings = signal<Settings | undefined>(undefined);
  /**
   * Auth keys
   */
  private readonly tokenKey = `${environment.sessionPrefix}_jwt`;
  private readonly settingsKey = `${environment.sessionPrefix}_set`;
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
    const token: AuthToken | undefined = this.getToken();

    // If the access token is null, the user is not logged in; return the original request
    if (
      !token ||
      request.url.includes(environment.auth.tokenUrl) ||
      (environment.auth.refreshTokenUrl && request.url.includes(environment.auth.refreshTokenUrl))
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
        this.storageService.set(
          this.tokenKey,
          { token: data.token, refresh_token: data.refreshToken },
          'local'
        );
        this.storageService.set(this.settingsKey, JSON.parse(data.settings), 'local');
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
  public async getSettings(networkOnly?: boolean, pushToken?: string): Promise<Settings | false> {
    // Get remote configuration
    let headers = {};
    if (pushToken) {
      headers = {
        'Push-Token': pushToken
      };
    }
    const networkSettings = lastValueFrom<Settings>(
      this.httpClient
        .get<Settings>(getApiUrl('settings'), {
          headers
        })
        .pipe(
          tap((response: Settings) => {
            this.storageService.set(this.settingsKey, response, 'local');
            this.settings.set(response);
            /*
            Sentry.setUser({
              email: response.user.email,
              username: response.user.username
            });
            */
          })
        )
    );
    if (networkOnly) {
      return networkSettings;
    }
    // Get local configuration
    const localSettings = this.storageService.get(this.settingsKey, 'local');
    if (localSettings) {
      this.settings.set(localSettings);
      /*
      Sentry.setUser({
        email: localSettings.user.email,
        username: localSettings.user.username
      });
      */
      return localSettings;
    }
    // If configuration cannot be obtained, the user must re-authenticate
    this.logout();
    return false;
  }
  /**
   * Gets the authentication token from storage
   */
  public getToken(): AuthToken | undefined {
    const token: AuthToken = this.storageService.get(this.tokenKey, 'local') || '';
    const jwtParts: string[] = token?.token?.split('.') || [];
    if (jwtParts.length === 3) {
      const payload: any = JSON.parse(window.atob(jwtParts[1]));
      return payload.exp > Math.round(Date.now() / 1000)
        ? token
        : { ...token, ...{ access_token: '' } };
    } else {
      return undefined;
    }
  }
  public getTokenPayload(): AuthTokenPayload | undefined {
    const decodedString: string = window.atob((this.getToken()?.token || '.').split('.')[1]);
    return decodedString ? JSON.parse(decodedString) : undefined;
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
    const token: AuthToken | undefined = this.getToken();
    if (token && token.refresh_token && environment.auth.refreshTokenUrl) {
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
      if (this.storageService.get(this.tokenKey, 'local')) {
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
  public async signin(data: Login): Promise<any> {
    const token = await lastValueFrom<AuthToken>(
      this.httpClient.post<AuthToken>(environment.auth.tokenUrl, data)
    );
    this.storageService.set(this.tokenKey, token, 'local');
    this.loggedIn.emit(true);
  }
  /**
   * Logs out the user
   */
  public logout(): boolean {
    this.storageService.delete(this.tokenKey, 'local');
    this.storageService.delete(this.settingsKey, 'local');
    this.storageService.delete(`${environment.sessionPrefix}_rdi`, 'local');
    this.storageService.delete(`${environment.sessionPrefix}_cur`, 'local');
    this.storageService.delete(`${environment.sessionPrefix}_dce`, 'local');
    this.dialog.closeAll();
    this.loggedIn.emit(false);
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
  public refreshToken(): Observable<AuthToken> {
    const token: AuthToken | undefined = this.getToken();
    return this.httpClient
      .post(environment.auth.refreshTokenUrl, { refresh_token: token?.refresh_token })
      .pipe(
        tap((token: any) => {
          this.storageService.set(this.tokenKey, token, 'local');
          this.loggedIn.emit(true);
        }),
        catchError((error) => {
          this.logout();
          return throwError(error);
        })
      );
  }
}

import { HttpRequest, HttpErrorResponse, HttpHeaders, HttpHandlerFn } from '@angular/common/http';
import { EventEmitter, Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { StorageService } from '@factor_ec/utils';
import * as Sentry from '@sentry/angular';

import { Login } from 'app/auth/models/login';
import { AuthToken } from 'app/auth/models/auth-token';
import { AuthTokenPayload } from 'app/auth/models/auth-token-payload';
import { Settings } from 'app/core/models/settings';
import { RestService } from 'app/core/rest.service';
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
  lastValueFrom,
} from 'rxjs';

import { environment } from 'environments/environment';
import { DeleteUser } from './components/delete-user/delete-user';
import { ChangePassword } from './components/change-password/change-password';

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
  // ... otras propiedades si hay
}

declare let navigator: any;

/**
 * Variables de sesión:
 * [PREFIX]_loc = locale
 * [PREFIX]_cid = client ID
 * [PREFIX]_lus = last user
 *
 * [PREFIX]_jwt = token sessipn
 * [PREFIX]_set = user settings
 * [PREFIX]_rdi = url redirect
 * [PREFIX]_cur = default currency
 * [PREFIX]_dce = delete code expires at
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private restService = inject(RestService);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private dialog = inject(MatDialog);

  signedIn = new EventEmitter<boolean>(false);
  signedUp = new EventEmitter<boolean>(false);
  loggedIn = new EventEmitter<boolean>(false);
  settings = signal<Settings | undefined>(undefined);
  /**
   * Auth keys
   */
  private tokenKey = `${environment.sessionPrefix}_jwt`;
  private settingsKey = `${environment.sessionPrefix}_set`;
  /**
   * Bandeja que indica si el token de acceso está siendo refrescado
   */
  public refreshTokenInProgress = false;
  /**
   * Maneja el flujo de refrescar el token de acceso
   */
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Envia el token de autenticación al servidor
   * @param request Solicitud HTTP
   * @returns
   */
  public addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    const token: AuthToken | undefined = this.getToken();

    // Si el token de acceso es nulo, esto significa que el usuario no está logueado y devolvemos la solicitud original
    if (
      !token ||
      request.url.includes(environment.auth.tokenUrl) ||
      (environment.auth.refreshTokenUrl && request.url.includes(environment.auth.refreshTokenUrl))
    ) {
      return request;
    }

    // Clona la petición, porque la petición original es inmutable
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token.token}`,
      },
    });
  }
  changePassword(): void {
    this.dialog.open(ChangePassword, {
      panelClass: 'ft-dialog',
      width: '400px',
    });
  }
  public async connect(client: 'google'): Promise<boolean> {
    const isChrome = navigator.userAgentData.brands.some((b: any) => b.brand === 'Google Chrome');

    if (isChrome && 'credentials' in navigator && 'get' in navigator.credentials) {
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
                  nonce: 'notprovided',
                },
              },
            ],
          },
          mediation: 'required',
        } as FedcmCredentialRequestOptions);
        if (!credential) {
          throw new Error('No credential obtained');
        }
        const fedcmCredential = credential as unknown as FedcmCredential;
        // Enviar el ID token al backend
        const response = await fetch(fedcm.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_token: JSON.parse(fedcmCredential.token).id_token,
          }),
        });
        const data = await response.json();
        this.storageService.set(
          this.tokenKey,
          { token: data.token, refresh_token: data.refreshToken },
          'local',
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
  confirmDeleteUser(): void {
    this.dialog.open(DeleteUser, {
      panelClass: 'ft-dialog',
      width: '400px',
    });
  }
  public generateNonce(length = 16): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  public async getSettings(networkOnly?: boolean, pushToken?: string): Promise<Settings | false> {
    // Obtiene configuración remota
    let headers = {};
    if (pushToken) {
      headers = {
        'Push-Token': pushToken,
      };
    }
    const networkSettings = lastValueFrom<Settings>(
      this.restService
        .get('settings', '', null, {
          headers,
        })
        .pipe(
          tap((response: Settings) => {
            this.storageService.set(this.settingsKey, response, 'local');
            this.settings.set(response);
            Sentry.setUser({
              email: response.user.email,
              username: response.user.username,
            });
          }),
        ),
    );
    if (networkOnly) {
      return networkSettings;
    }
    // Obtiene configuración local
    const localSettings = this.storageService.get(this.settingsKey, 'local');
    if (localSettings) {
      this.settings.set(localSettings);
      Sentry.setUser({
        email: localSettings.user.email,
        username: localSettings.user.username,
      });
      return localSettings;
    }
    // Si no es capaz de obtener la configuración debe volver a autenticarse
    this.logout();
    return false;
  }
  /**
   * Obtiene el token de autenticación del storage
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
   * Maneja el flujo de refrescar el token de acceso o de redirección al signin
   * @param err Error HTTP
   * @param request Petición HTTP enviada
   * @param next Manejador HTTP
   */
  public handle401Error(
    err: HttpErrorResponse,
    request: HttpRequest<any>,
    next: HttpHandlerFn,
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
            // If we don't get a new token, we are in trouble so logout.
            this.logout();
            return throwError(
              () =>
                new HttpErrorResponse({
                  error: {},
                  headers: new HttpHeaders(),
                  status: 401,
                  statusText: '',
                  url: undefined,
                }),
            );
          }),
          catchError((error) => {
            // It cant replace access token set error status 401 to continue flow
            return throwError(
              () =>
                new HttpErrorResponse({
                  error: error.error,
                  headers: error.headers,
                  status: 401,
                  statusText: error.statusText,
                  url: error.url || undefined,
                }),
            );
          }),
          share(),
          finalize(() => {
            this.refreshTokenInProgress = false;
          }),
        );
      } else {
        return this.refreshTokenSubject.pipe(
          filter((token) => token != null),
          take(1),
          switchMap(() => {
            return next(this.addAuthenticationToken(request));
          }),
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
   * Envia el signin al servidor y obtiene el token de autenticación
   * @param data Datos de autenticación
   * @returns
   */
  async signin(data: Login): Promise<any> {
    const token = await lastValueFrom<AuthToken>(
      this.restService.post(environment.auth.tokenUrl, data),
    );
    this.storageService.set(this.tokenKey, token, 'local');
    this.loggedIn.emit(true);
  }
  /**
   * Cierra la sesión del usuario
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
    return lastValueFrom(this.restService.post(environment.auth.signupUrl, data, options));
  }
  /**
   * En el caso de tener implementado un refresh token, se envia al servidor para obtener un nuevo token de acceso
   * @returns Token de acceso
   */
  public refreshToken(): Observable<AuthToken> {
    const token: AuthToken | undefined = this.getToken();
    const url = `${environment.auth.refreshTokenUrl}`;
    return this.restService.post(url, { refresh_token: token?.refresh_token }).pipe(
      tap((token: any) => {
        this.storageService.set(this.tokenKey, token, 'local');
        this.loggedIn.emit(true);
      }),
      catchError((error) => {
        this.logout();
        return throwError(error);
      }),
    );
  }
}

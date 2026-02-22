import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, throwError } from 'rxjs';

import { AUTH_CONFIG } from './auth-config.token';
import { AuthService } from './auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authConfig = inject(AUTH_CONFIG);
  const authService = inject(AuthService);
  const authReq = authService.addAuthenticationToken(req);
  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        switch ((error as HttpErrorResponse).status) {
          case 401:
            if (!req.url.includes(authConfig.auth.refreshTokenUrl)) {
              return authService.handle401Error(error, req, next);
            } else {
              authService.logout();
              return throwError(() => error);
            }
          default:
            return throwError(() => error);
        }
      } else {
        return throwError(() => error);
      }
    })
  );
};

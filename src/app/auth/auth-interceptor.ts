import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, throwError } from 'rxjs';

import { AuthService } from 'app/auth/auth-service';
import { environment } from 'environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authReq = authService.addAuthenticationToken(req);
  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        switch ((error as HttpErrorResponse).status) {
          case 401:
            if (authService.handle401Error && !req.url.includes(environment.auth.refreshTokenUrl)) {
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

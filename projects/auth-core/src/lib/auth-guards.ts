import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

import { StorageService } from '@factor_ec/utils';
import { AUTH_CONFIG } from './auth-config.token';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = async (route, state) => {
  const config = inject(AUTH_CONFIG);
  const router = inject(Router);
  const authService = inject(AuthService);
  const storageService = inject(StorageService);

  if (!authService.isLoggedIn()) {
    storageService.set(`${config.sessionPrefix}_rdi`, state.url);
    return router.createUrlTree([window.innerWidth < 1000 ? '/auth' : '/signin']);
  }
  return true;
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn() ? router.createUrlTree(['/']) : true;
};

export const resetGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = route.queryParamMap.get('token');

  if (token && !authService.isLoggedIn()) {
    return true;
  } else if (authService.isLoggedIn()) {
    return router.createUrlTree(['/']);
  } else {
    router.navigateByUrl(`/error/403`, { skipLocationChange: true });
    return false;
  }
};

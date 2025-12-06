import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

import { AppManager } from 'app/core/services/app-manager';
import { environment } from 'environments/environment';
import { AuthService } from 'app/cross/auth/auth-service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const appManager = inject(AppManager);
  const router = inject(Router);
  // Check authentication
  if (!authService.getToken() || !authService.settings()) {
    sessionStorage.setItem(`${environment.sessionPrefix}_rdi`, state.url);
    router.navigateByUrl(window.innerWidth < 1000 ? '/auth' : '/signin');
    return false;
  }
  if (!appManager.initialized) {
    return false;
  }
  return true;
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return !authService.getToken();
};

export const resetGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = route.queryParamMap.get('token');

  if (token && !authService.getToken()) {
    return true;
  } else if (authService.getToken()) {
    router.navigateByUrl(`/`);
    return false;
  } else {
    router.navigateByUrl(`/error/403`, { skipLocationChange: true });
    return false;
  }
};

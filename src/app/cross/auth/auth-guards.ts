import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

import { AppManager } from 'app/core/services/app-manager';
import { environment } from 'environments/environment';
import { Session } from 'app/core/services/session';

export const authGuard: CanActivateFn = async (route, state) => {
  //Dependency injection
  const appManager = inject(AppManager);
  const router = inject(Router);
  const session = inject(Session);

  // Check authentication
  if (!session.isLoggedIn() || !session.settings()) {
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
  const session = inject(Session);
  return !session.isLoggedIn();
};

export const resetGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const session = inject(Session);
  const router = inject(Router);
  const token = route.queryParamMap.get('token');

  if (token && !session.isLoggedIn()) {
    return true;
  } else if (session.isLoggedIn()) {
    router.navigateByUrl(`/`);
    return false;
  } else {
    router.navigateByUrl(`/error/403`, { skipLocationChange: true });
    return false;
  }
};

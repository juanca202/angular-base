import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

import { environment } from '@/environments/environment';
import { Session } from '@/core/services/session';
import { StorageService } from '@factor_ec/utils';

export const authGuard: CanActivateFn = async (route, state) => {
  //Dependency injection
  const router = inject(Router);
  const session = inject(Session);
  const storageService = inject(StorageService);

  // Check authentication
  if (!session.isLoggedIn() || !session.settings()) {
    storageService.set(`${environment.sessionPrefix}_rdi`, state.url);
    router.navigateByUrl(window.innerWidth < 1000 ? '/auth' : '/signin');
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
    return router.createUrlTree(['/']);
  } else {
    router.navigateByUrl(`/error/403`, { skipLocationChange: true });
    return false;
  }
};

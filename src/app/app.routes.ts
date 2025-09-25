import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, Routes } from '@angular/router';
import { environment } from '../environments/environment.development';
import { AppService } from './core/app.service';
import { AuthService } from './core/auth.service';
import { Auth } from './core/components/auth/auth';
import { Error } from './core/components/error/error';
import { Notifications } from './core/components/notifications/notifications';
import { ResetPassword } from './core/components/reset-password/reset-password';
import { Settings } from './core/components/settings/settings';
import { Home } from './main/components/home/home';
import { Language } from './core/components/language/language';
import { MainLayout } from './core/components/main-layout/main-layout';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const appService = inject(AppService);
  const router = inject(Router);
  // Verifica authenticación
  if (!authService.getToken() || !authService.settings()) {
    sessionStorage.setItem(`${environment.sessionPrefix}_rdi`, state.url);
    router.navigateByUrl(window.innerWidth < 1000 ? '/auth' : '/signin');
    return false;
  }
  if (!appService.initialized) {
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

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [{ path: 'home', component: Home }],
  },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  {
    path: 'settings/language',
    component: Language,
    canActivate: [authGuard],
  },

  { path: 'auth', component: Auth, canActivate: [loginGuard] },
  {
    path: 'signin',
    component: Auth,
    data: { mode: 'signin' },
    canActivate: [loginGuard],
  },
  {
    path: 'signup',
    component: Auth,
    data: { mode: 'signup' },
    canActivate: [loginGuard],
  },
  {
    path: 'reset-password',
    component: ResetPassword,
    canActivate: [resetGuard],
  },
  {
    path: 'notifications',
    component: Notifications,
    canActivate: [authGuard],
  },
  { path: 'error/:code', component: Error, title: $localize`Error` },
  { path: '**', component: Error, data: { code: 404 } },
];

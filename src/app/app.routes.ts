import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  Routes
} from '@angular/router';
import { environment } from '../environments/environment.development';
import { AppService } from './core/app.service';
import { AuthService } from './core/auth.service';
import { AuthComponent } from './core/components/auth/auth.component';
import { ErrorComponent } from './core/components/error/error.component';
import { NotificationsComponent } from './core/components/notifications/notifications.component';
import { ResetPasswordComponent } from './core/components/reset-password/reset-password.component';
import { SettingsComponent } from './core/components/settings/settings.component';
import { Home } from './main/components/home/home';
import { LanguageComponent } from './core/components/language/language.component';

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
  { path: 'home', component: Home, canActivate: [authGuard] },

  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  {
    path: 'settings/language',
    component: LanguageComponent,
    canActivate: [authGuard]
  },

  { path: 'auth', component: AuthComponent, canActivate: [loginGuard] },
  {
    path: 'signin',
    component: AuthComponent,
    data: { mode: 'signin' },
    canActivate: [loginGuard]
  },
  {
    path: 'signup',
    component: AuthComponent,
    data: { mode: 'signup' },
    canActivate: [loginGuard]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [resetGuard]
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard]
  },
  { path: 'error/:code', component: ErrorComponent, title: $localize`Error` },
  { path: '**', component: ErrorComponent, data: { code: 404 } }
];

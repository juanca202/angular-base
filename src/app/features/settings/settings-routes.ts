import { Language } from '@/features/settings/components/language/language';
import { Routes } from '@angular/router';
import { Settings } from './components/settings/settings';
import { authGuard, loginGuard, resetGuard } from '@factor_ec/utils';
import { Auth } from './components/auth/auth';
import { ResetPassword } from './components/reset-password/reset-password';

export const settingsRoutes: Routes = [
  { path: 'settings', component: Settings, title: $localize`Settings`, canActivate: [authGuard] },
  {
    path: 'settings/language',
    component: Language,
    title: $localize`Language`,
    canActivate: [authGuard]
  },
  { path: 'auth', component: Auth, canActivate: [loginGuard] },
  {
    path: 'signin',
    component: Auth,
    data: { mode: 'signin' },
    title: $localize`Sign in`,
    canActivate: [loginGuard]
  },
  {
    path: 'signup',
    component: Auth,
    data: { mode: 'signup' },
    title: $localize`Sign up`,
    canActivate: [loginGuard]
  },
  {
    path: 'reset-password',
    component: ResetPassword,
    title: $localize`Reset password`,
    canActivate: [resetGuard]
  }
];

import { Routes } from '@angular/router';
import { loginGuard, resetGuard } from './auth-guards';
import { Auth } from './components/auth/auth';
import { ResetPassword } from './components/reset-password/reset-password';

export const authRoutes: Routes = [
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

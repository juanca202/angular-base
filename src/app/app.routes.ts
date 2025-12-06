import { Routes } from '@angular/router';
import { Error } from './core/components/error/error';
import { Settings } from './core/components/settings/settings';
import { Language } from './core/components/language/language';
import { MainLayout } from './core/components/main-layout/main-layout';
import { authGuard } from './cross/auth/auth-guards';
import { authRoutes } from './cross/auth/auth-routes';

export const routes: Routes = [
  ...authRoutes,
  {
    path: '',
    component: MainLayout,
    children: []
  },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  { path: 'settings/language', component: Language },
  { path: 'error/:code', component: Error, title: $localize`Error` },
  { path: '**', component: Error, data: { code: 404 } }
];

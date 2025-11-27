import { Routes } from '@angular/router';
import { Error } from './core/components/error/error';
import { Notifications } from './core/components/notifications/notifications';
import { Settings } from './core/components/settings/settings';
import { Language } from './core/components/language/language';
import { MainLayout } from './core/components/main-layout/main-layout';
import { samplesRoutes } from './samples/samples-routes';
import { authGuard } from './auth/auth-guards';
import { authRoutes } from './auth/auth-routes';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  ...authRoutes,
  {
    path: '',
    component: MainLayout,
    children: [...samplesRoutes],
  },
  { path: 'settings', component: Settings },
  {
    path: 'settings/language',
    component: Language,
  },
  {
    path: 'notifications',
    component: Notifications,
  },
  { path: 'error/:code', component: Error, title: $localize`Error` },
  { path: '**', component: Error, data: { code: 404 } },
];

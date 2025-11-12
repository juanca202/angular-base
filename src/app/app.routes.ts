import { Routes } from '@angular/router';
import { Error } from './core/components/error/error';
import { Notifications } from './core/components/notifications/notifications';
import { Settings } from './core/components/settings/settings';
import { Language } from './core/components/language/language';
import { MainLayout } from './core/components/main-layout/main-layout';
import { authGuard } from './auth/auth-guards';
import { authRoutes } from './auth/auth-routes';
import { samplesRoutes } from './samples/samples-routes';
import { contactsRoutes } from './contacts/contacts-routes';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  ...authRoutes,
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [...samplesRoutes, ...contactsRoutes],
  },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  {
    path: 'settings/language',
    component: Language,
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    component: Notifications,
    canActivate: [authGuard],
  },
  { path: 'error/:code', component: Error, title: $localize`Error` },
  { path: '**', component: Error, data: { code: 404 } },
];

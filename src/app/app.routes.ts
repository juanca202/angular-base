import { Routes } from '@angular/router';

import { MainLayout } from './core/components/main-layout/main-layout';
import { Language } from './core/components/language/language';
import { Settings } from './core/components/settings/settings';
import { Error } from './core/components/error/error';
import { authGuard } from './auth/auth-guards';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth-routes').then((m) => m.authRoutes)
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'settings'
      },
      {
        path: 'settings',
        component: Settings
      },
      {
        path: 'settings/language',
        component: Language
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./notifications/notifications-routes').then((m) => m.notificationsRoutes)
      },
      {
        path: 'samples',
        loadChildren: () => import('./templates/templates-routes').then((m) => m.samplesRoutes)
      }
    ]
  },
  {
    path: 'error/:code',
    component: Error,
    title: $localize`Error`
  },
  {
    path: '**',
    redirectTo: 'error/404'
  }
];

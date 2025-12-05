import { Routes } from '@angular/router';

import { MainLayout } from './core/components/main-layout/main-layout';
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
        loadChildren: () => import('./settings/settings-routes').then((m) => m.settingsRoutes)
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
    path: 'error',
    loadChildren: () => import('./error/error-routes').then((m) => m.errorRoutes)
  },
  {
    path: '**',
    redirectTo: 'error/404'
  }
];

import { Routes } from '@angular/router';

import { MainLayout } from './core/components/main-layout/main-layout';
import { Language } from './core/components/language/language';
import { Settings } from './core/components/settings/settings';
import { Error } from './core/components/error/error';
import { authGuard } from './cross/auth/auth-guards';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./cross/auth/auth-routes').then((m) => m.authRoutes)
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'settings',
        component: Settings
      },
      {
        path: 'settings/language',
        component: Language
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

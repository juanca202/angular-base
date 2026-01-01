import { Routes } from '@angular/router';
import { Error } from '@/core/components/error/error';
import { Settings } from '@/core/components/settings/settings';
import { Language } from '@/core/components/language/language';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'entities',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/templates/templates-routes').then((m) => m.templatesRoutes)
  },
  {
    path: '',
    loadChildren: () => import('./cross/auth/auth-routes').then((m) => m.authRoutes)
  },
  { path: 'settings', component: Settings },
  { path: 'settings/language', component: Language },
  { path: 'error/:code', component: Error, title: $localize`Error` },
  { path: '**', component: Error, data: { code: 404 } }
];

import { Routes } from '@angular/router';
import { Error } from '@/core/components/error/error';

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
    loadChildren: () => import('./features/settings/settings-routes').then((m) => m.settingsRoutes)
  },
  { path: 'error/:code', component: Error, title: $localize`Error` },
  { path: '**', component: Error, data: { code: 404 } }
];

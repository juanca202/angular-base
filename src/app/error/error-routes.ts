import { Routes } from '@angular/router';

import { Error } from './components/error/error';

export const errorRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'unknown',
        pathMatch: 'full'
      },
      {
        path: ':code',
        component: Error,
        title: $localize`Error`
      }
    ]
  }
];

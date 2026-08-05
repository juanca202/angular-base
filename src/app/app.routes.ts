import { Routes } from '@angular/router';
import { Error } from '@/core/components/error/error';

export const routes: Routes = [
  { path: 'error/:code', component: Error, title: $localize`Error` },
  { path: '**', component: Error, data: { code: 404 } },
];

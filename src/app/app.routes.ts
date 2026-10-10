import { Routes } from '@angular/router';
import { Error } from '@/core/components/error/error';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@/features/home/components/home-page').then((m) => m.HomePage),
    title: $localize`Inicio`,
    children: [
      { path: '', pathMatch: 'full', children: [] },
      {
        path: 'enviar',
        loadComponent: () => import('@/features/send/components/send-page').then((m) => m.SendPage),
        title: $localize`Enviar archivo`,
      },
      {
        path: 'recibir',
        loadComponent: () =>
          import('@/features/receive/components/receive-page').then((m) => m.ReceivePage),
        title: $localize`Recibir archivo`,
      },
    ],
  },
  { path: 'error/:code', component: Error, title: $localize`Error` },
  { path: '**', component: Error, data: { code: 404 } },
];

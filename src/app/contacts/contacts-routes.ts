import { Routes } from '@angular/router';

import { ContactCreate } from './components/contact-create/contact-create';

export const contactsRoutes: Routes = [
  { path: 'contacts', redirectTo: 'contacts/new', pathMatch: 'full' },
  {
    path: 'contacts/new',
    component: ContactCreate,
    title: $localize`Nuevo contacto`,
  },
];

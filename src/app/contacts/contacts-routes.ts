import { Routes } from '@angular/router';

import { ContactCreate } from './components/contact-create/contact-create';

export const contactsRoutes: Routes = [
  {
    path: 'contacts/new',
    component: ContactCreate,
    title: $localize`Nuevo contacto`,
  },
];

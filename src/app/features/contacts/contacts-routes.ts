import { Routes } from '@angular/router';
import { ContactList } from './components/contact-list/contact-list';

export const contactsRoutes: Routes = [
  {
    path: '',
    component: ContactList
  }
];

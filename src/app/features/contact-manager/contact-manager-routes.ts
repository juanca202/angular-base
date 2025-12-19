import { Routes } from '@angular/router';

import { ContactList } from './components/contact-list/contact-list';

export const contactManagerRoutes: Routes = [{ path: 'contacts', component: ContactList }];

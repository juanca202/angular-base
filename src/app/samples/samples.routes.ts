import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { CustomerList } from './components/customer-list/customer-list';

export const samplesRoutes: Routes = [
  { path: 'home', component: Home },
  { path: 'customer-list', component: CustomerList },
];

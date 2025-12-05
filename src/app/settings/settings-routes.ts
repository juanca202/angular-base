import { Routes } from '@angular/router';

import { Language } from './components/language/language';
import { Settings } from './components/settings/settings';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: Settings
  },
  {
    path: 'language',
    component: Language
  }
];

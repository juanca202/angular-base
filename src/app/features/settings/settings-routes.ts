import { Language } from '@/features/settings/components/language/language';
import { authGuard } from '@/cross/auth/auth-guards';
import { Routes } from '@angular/router';
import { Settings } from './components/settings/settings';

export const settingsRoutes: Routes = [
  { path: 'settings', component: Settings, title: $localize`Settings`, canActivate: [authGuard] },
  {
    path: 'settings/language',
    component: Language,
    title: $localize`Language`,
    canActivate: [authGuard]
  }
];

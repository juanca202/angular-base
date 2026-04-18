import { LanguagePicker } from '@/features/settings/components/language-picker/language-picker';
import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  { path: 'settings/language', component: LanguagePicker, title: $localize`Language` }
];

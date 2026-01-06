import { Routes } from '@angular/router';
import { RequirementListComponent } from './components/requirement-list/requirement-list';
import { RequirementDetailComponent } from './components/requirement-detail/requirement-detail';

export const requirementsRoutes: Routes = [
  { path: '', component: RequirementListComponent },
  { path: ':id', component: RequirementDetailComponent }
];

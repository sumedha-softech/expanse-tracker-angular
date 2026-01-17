import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'record-list', pathMatch: 'full' },
    { path: 'record-list', loadComponent: () => import('./components/record-list/record-list.component').then(c => c.RecordListComponent) },
    { path: 'category', loadComponent: () => import('./components/category/category.component').then(c => c.CategoryComponent) },
    { path: 'account', loadComponent: () => import('./components/account/account.component').then(c => c.AccountComponent) },
    { path: 'budget', loadComponent: () => import('./components/budget/budget.component').then(c => c.BudgetComponent) },
    { path: 'analysis', loadComponent: () => import('./components/analysis/analysis.component').then(c => c.AnalysisComponent) },
    { path: 'log-activity', loadComponent: () => import('./components/log-activity/log-activity.component').then(c => c.LogActivityComponent) }

];



import { Routes } from '@angular/router';
import { CategoryComponent } from './components/category/category.component';
import { AccountComponent } from './components/account/account.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RecordListComponent } from './components/record-list/record-list.component';
import { LogActivityComponent } from './components/log-activity/log-activity.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { BudgetComponent } from './components/budget/budget.component';

export const routes: Routes = [
    
    {path: '', redirectTo: 'record-list', pathMatch: 'full'},
    {path: 'sidebar', component: SidebarComponent},
   // {path: 'dashboard', component: DashboardComponent},
    {path: 'category', component: CategoryComponent},
    {path: 'account', component: AccountComponent},
    {path: 'record-list', component: RecordListComponent},
    {path: 'budget', component: BudgetComponent},
    {path: 'analysis', component: AnalysisComponent},
    {path: 'log-activity', component: LogActivityComponent}
];

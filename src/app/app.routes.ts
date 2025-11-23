import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: 'briefing',
        loadComponent: () => import('./components/briefing/briefing.component').then(m => m.BriefingComponent)
    },
    {
        path: '',
        component: DashboardComponent
    }
];

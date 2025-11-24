import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [

    {
        path: 'content/:id',
        loadComponent: () => import('./components/detailed-view/detailed-view.component').then(m => m.DetailedViewComponent)
    },
    {
        path: '',
        component: DashboardComponent
    }
];

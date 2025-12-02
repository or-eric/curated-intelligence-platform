import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LibraryComponent } from './components/library/library.component';

export const routes: Routes = [
    {
        path: 'content/:id',
        loadComponent: () => import('./components/detailed-view/detailed-view.component').then(m => m.DetailedViewComponent)
    },
    {
        path: 'library',
        component: LibraryComponent
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: '',
        component: DashboardComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

import { Routes } from '@angular/router';
import { AuthLayout } from '../../shared/layout/auth.layout';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', loadComponent: () => import('./views/login.page').then(m => m.LoginPage) },
      { path: 'register', loadComponent: () => import('./views/register.page').then(m => m.RegisterPage) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];
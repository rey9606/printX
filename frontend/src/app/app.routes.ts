import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'app', 
    pathMatch: 'full' 
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'app',
    loadChildren: () => import('./features/client/client.routes').then(m => m.CLIENT_ROUTES)
  }
];

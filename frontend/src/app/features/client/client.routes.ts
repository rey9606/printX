import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [() => {
      const authService: AuthService = inject(AuthService);
      const router: Router = inject(Router);
      
      if (authService.isAuthenticated()) {
        return true;
      }
      return router.createUrlTree(['/auth']);
    }],
    children: [
      { path: '', loadComponent: () => import('./views/home.page').then(m => m.HomePage) }
    ]
  }
];

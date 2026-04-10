import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-800">PrintX</h1>
          <div class="flex items-center gap-4">
            <span class="text-gray-600">Hola, {{ authService.currentUser()?.name }}</span>
            <button 
              (click)="logout()"
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto py-8 px-4">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Bienvenido a PrintX</h2>
          <p class="text-gray-600">Tu panel de control está listo.</p>
        </div>
      </main>
    </div>
  `
})
export class HomePage {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

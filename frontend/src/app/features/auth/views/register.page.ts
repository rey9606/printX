import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterForm, type RegisterFormOutput } from '../components/register-form/register-form';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RegisterForm, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Crear cuenta</h1>
      <app-register-form (submitted)="onSubmit($event)" />
      <p class="text-center text-sm text-gray-600 mt-4">
        ¿Ya tienes cuenta? <a routerLink="/auth/login" class="text-blue-600 hover:underline">Inicia sesión</a>
      </p>
    </div>
  `
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly registerForm = signal<RegisterForm | null>(null);

  onSubmit(data: RegisterFormOutput) {
    this.authService.register(data.email, data.password, data.name).then(result => {
      if (result.success) {
        this.router.navigate(['/app']);
      } else if (result.error) {
        this.registerForm()?.onRegisterComplete(false, result.error);
      }
    });
  }
}
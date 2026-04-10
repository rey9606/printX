import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginForm, type LoginFormOutput } from '../components/login-form/login-form';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginForm, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar sesión</h1>
      <app-login-form (submitted)="onSubmit($event)" />
      <p class="text-center text-sm text-gray-600 mt-4">
        ¿No tienes cuenta? <a routerLink="/auth/register" class="text-blue-600 hover:underline">Regístrate</a>
      </p>
    </div>
  `
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly loginForm = signal<LoginForm | null>(null);

  onSubmit(data: LoginFormOutput) {
    this.authService.login(data.email, data.password).then(result => {
      if (result.success) {
        this.router.navigate(['/app']);
      } else if (result.error) {
        this.loginForm()?.onLoginComplete(false, result.error);
      }
    });
  }
}
import { Component, signal, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface RegisterFormOutput {
  email: string;
  password: string;
  name: string;
}

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-form.html'
})
export class RegisterForm {
  private fb = inject(FormBuilder);

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly submitted = output<RegisterFormOutput>();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, name } = this.form.value;
    this.submitted.emit({ email: email!, password: password!, name: name! });
  }

  onRegisterComplete(success: boolean, error?: string) {
    this.loading.set(false);
    if (!success && error) {
      this.error.set(error);
    }
  }
}
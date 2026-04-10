import { Component, signal, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface LoginFormOutput {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-form.html'
})
export class LoginForm {
  private fb = inject(FormBuilder);

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly submitted = output<LoginFormOutput>();

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.value;
    this.submitted.emit({ email: email!, password: password! });
  }

  onLoginComplete(success: boolean, error?: string) {
    this.loading.set(false);
    if (!success && error) {
      this.error.set(error);
    }
  }
}
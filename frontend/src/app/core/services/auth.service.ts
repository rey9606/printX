import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { I_User } from '../models/user.model';

const API_URL = 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'printx_token';
const USER_KEY = 'printx_user';

interface AuthResponse {
  accessToken: string;
  user: I_User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private token = signal<string | null>(this.loadToken());
  private user = signal<I_User | null>(this.loadUser());

  readonly isAuthenticated = computed(() => !!this.token());
  readonly currentUser = this.user.asReadonly();

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): I_User | null {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  private saveUser(user: I_User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }).toPromise();
      
      if (response) {
        this.saveToken(response.accessToken);
        this.saveUser(response.user);
        return { success: true };
      }
      return { success: false, error: 'Error en el servidor' };
    } catch (error: any) {
      const message = error.error?.message || 'Error al iniciar sesión';
      return { success: false, error: message };
    }
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.http.post<AuthResponse>(`${API_URL}/auth/register`, { email, password, name }).toPromise();
      
      if (response) {
        this.saveToken(response.accessToken);
        this.saveUser(response.user);
        return { success: true };
      }
      return { success: false, error: 'Error en el servidor' };
    } catch (error: any) {
      const message = error.error?.message || 'Error al registrar';
      return { success: false, error: message };
    }
  }

  logout(): void {
    this.clearAuth();
  }
}
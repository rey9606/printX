import { Injectable, signal, computed } from '@angular/core';
import { I_User } from '../models/user.model';

const TOKEN_KEY = 'printx_token';
const USER_KEY = 'printx_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
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
    const mockUser: I_User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    };
    const mockToken = 'mock_jwt_token_' + Date.now();

    this.saveToken(mockToken);
    this.saveUser(mockUser);

    return { success: true };
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> {
    const mockUser: I_User = {
      id: '1',
      email,
      name,
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    };
    const mockToken = 'mock_jwt_token_' + Date.now();

    this.saveToken(mockToken);
    this.saveUser(mockUser);

    return { success: true };
  }

  logout(): void {
    this.clearAuth();
  }
}
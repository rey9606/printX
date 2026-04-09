import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { I_User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private auth = inject(AuthService);

  getCurrentUser(): I_User | null {
    return this.auth.currentUser();
  }
}
export interface I_User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  createdAt: string;
}
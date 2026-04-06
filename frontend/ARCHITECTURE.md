# Frontend Architecture - PrintX

## Estructura de Carpetas

```
src/
├── app/
│   ├── core/                    # Configuración y servicios globales
│   │   ├── config/              # Environment
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── guards/              # Route guards
│   │   ├── services/            # Singleton services
│   │   │   ├── auth.service.ts
│   │   │   ├── theme.service.ts
│   │   │   └── notification.service.ts
│   │   └── theme/               # Sistema de diseño
│   │       ├── design-tokens.ts
│   │       └── themes.ts
│   │
│   ├── shared/                  # Componentes reutilizables
│   │   ├── ui/                  # UI Kit atómico
│   │   ├── layout/              # Layouts base
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── models/
│   │
│   ├── features/                # Features autónomos
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── components/
│   │   │   └── views/
│   │   ├── client/
│   │   │   ├── client.routes.ts
│   │   │   ├── services/
│   │   │   ├── components/
│   │   │   └── views/
│   │   ├── provider/
│   │   │   ├── provider.routes.ts
│   │   │   ├── services/
│   │   │   ├── components/
│   │   │   └── views/
│   │   └── admin/
│   │
│   ├── pages/                   # Páginas globales
│   │   ├── home/
│   │   ├── not-found/
│   │   └── maintenance/
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── assets/
└── styles.scss
```

## Patrones Angular 21

### 1. Componentes Standalone

```typescript
@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class OrderCardComponent {}
```

### 2. Signals para Estado

```typescript
@Injectable({ providedIn: 'root' })
export class OrderStore {
  private orders = signal<Order[]>([]);
  
  readonly pendingOrders = computed(() => 
    this.orders().filter(o => o.status === 'PENDING')
  );
  
  readonly allOrders = this.orders.asReadonly();
}
```

### 3. inject() en vez de constructor

```typescript
// ✅ New way
private http = inject(HttpClient);
private store = inject(OrderStore);

// ❌ Old way
constructor(private http: HttpClient) {}
```

### 4. Control de Flujo

```html
@if (orders().length > 0) {
  @for (order of orders(); track order.id) {
    <app-order-card [order]="order" />
  }
} @else {
  <p>No hay pedidos</p>
}
```

### 5. Lazy Loading

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.routes')
      .then(m => m.CLIENT_ROUTES)
  }
];
```

## Diseño System

### Theme Service

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme = signal<'light' | 'dark'>('light');
  readonly theme = this.currentTheme.asReadonly();
  readonly isDark = computed(() => this.currentTheme() === 'dark');
  
  toggleTheme() {
    this.currentTheme.update(t => t === 'light' ? 'dark' : 'light');
  }
}
```

### Design Tokens

```typescript
// core/theme/design-tokens.ts
export const DESIGN_TOKENS = {
  colors: {
    primary: { DEFAULT: '#7B2CBF', light: '#9D4EDD', dark: '#5A189A' },
    secondary: { DEFAULT: '#2D6A4F', light: '#40916C', dark: '#1B4332' },
  }
} as const;
```

## Auth: Core vs Feature

### Core: AuthService (singleton)

```typescript
// core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(null);
  private user = signal<I_User | null>(null);
  
  readonly isAuthenticated = computed(() => !!this.token());
  readonly currentUser = this.user.asReadonly();
  
  async login(email: string, password: string) {
    // Lógica de login
  }
  
  logout() {
    this.token.set(null);
    this.user.set(null);
  }
}
```

### Feature: Auth UI

```
features/auth/
├── auth.routes.ts
├── components/
│   ├── login-form/
│   ├── register-form/
│   └── forgot-password/
└── views/
    ├── login.page.ts
    ├── register.page.ts
    └── forgot-password.page.ts
```

## Rutas y Alias

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["app/core/*"],
      "@shared/*": ["app/shared/*"],
      "@features/*": ["app/features/*"],
      "@env/*": ["environments/*"]
    }
  }
}
```

---

**Relacionado**
- [Arquitectura General](../../doc/architecture.md)
- [API Overview](../../doc/api.md)
- [Guía de Inicio](../../doc/guides.md)

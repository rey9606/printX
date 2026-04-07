# printX - Agent Configuration

## Stack Tecnológico

### Backend
- **Framework**: NestJS 11.x
- **Lenguaje**: TypeScript 5.7.x
- **Runtime**: Node.js

### Frontend
- **Framework**: Angular 21.x
- **Lenguaje**: TypeScript 5.9.x
- **Gestor de paquetes**: pnpm
- **Estilos**: Tailwind CSS 4.x

### Infraestructura
- Docker / Docker Compose

---

## Comandos Disponibles

### Backend (directorio: `backend/`)
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev        # Iniciar con watch mode
npm run start:debug     # Modo debug con watch

# Build
npm run build           # Compilar a producción

# Testing
npm run test            # Ejecutar tests
npm run test:watch     # Tests en watch mode
npm run test:cov       # Coverage report

# Linting
npm run lint            # Verificar y corregir código
npm run format          # Formatear con Prettier
```

### Frontend (directorio: `frontend/`)
```bash
# Instalar dependencias (usa pnpm)
pnpm install

# Desarrollo
pnpm start              # Iniciar servidor dev (ng serve)
pnpm watch              # Build con watch mode

# Build
pnpm build              # Compilar a producción

# Testing
pnpm test               # Ejecutar tests (vitest)
```

---

## Convenciones de Código

### TypeScript
- Usar strict type checking
- Preferir type inference cuando el tipo es obvio
- Evitar `any`; usar `unknown` cuando haya incertidumbre

### Backend (NestJS)
- Usar módulos standalone
- Inyección con `inject()` en lugar de constructor
- Services con `providedIn: 'root'`

### Frontend (Angular)
- **Componentes standalone** (por defecto en Angular 20+)
- No usar `@HostBinding` ni `@HostListener`; usar `host` en el decorador
- Usar **signals** para estado local (`input()`, `output()`, `computed()`)
- Cambiar detection: `ChangeDetectionStrategy.OnPush`
- Usar control flow nativo (`@if`, `@for`, `@switch`) en lugar de `*ngIf`, `*ngFor`
- Usar **Reactive Forms** en lugar de Template-driven
- No usar `ngClass` ni `ngStyle`; usar bindings `class` y `style`
- Imágenes: usar `NgOptimizedImage`
- Priorizar templates/styles inline para componentes pequeños
- Forms: usar `inject()` en lugar de constructor

### General
- **Accesibilidad**: Debe pasar AXE checks y WCAG AA
- Formateo con Prettier
- ESLint para linting

---

## Cómo Trabajar con los Issues

1. **Labels de fase**: Los issues usan labels como `phase-foundation`, `phase-auth`, etc.
2. **Flujo de trabajo**:
   - Revisar los issues abiertos en GitHub
   - Cada issue tiene tareas específicas con checkboxes
   - Al completar un issue, se marca como done
3. **Commits**: Mensajes claros descriptivos del cambio
4. **Commitar pronto**: Hacer commits pequeños y frecuentes

---

## Estructura del Proyecto

```
printX/
├── backend/           # API NestJS
│   ├── src/
│   │   ├── app/
│   │   ├── main.ts
│   │   └── ...
│   ├── test/
│   ├── .gitignore
│   └── package.json
│
├── frontend/          # App Angular
│   ├── src/
│   │   ├── app/
│   │   ├── main.ts
│   │   └── ...
│   ├── .gitignore
│   └── package.json
│
├── doc/               # Documentación del proyecto
│   └── PHASES.md
│
├── docker-compose.yml
├── README.md
└── AGENTS.md          # Este archivo
```
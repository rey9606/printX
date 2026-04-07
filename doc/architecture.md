# Arquitectura - PrintX

## Visión General

PrintX sigue una arquitectura cliente-servidor con separación clara de responsabilidades y un patrón de diseño basado en eventos.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Angular 21+)                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  Core   │  │ Shared  │  │Feature: │  │Feature:│          │
│  │(Config) │  │(UI/Lib) │  │ Client  │  │Provider│          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (NestJS)                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │Modules: │  │Modules: │  │Modules: │  │Modules: │          │
│  │ Auth    │  │ Orders  │  │ Chat    │  │Offers   │          │
│  │ Users   │  │ Files   │  │Payments │  │Stats    │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │    Redis     │  │ Local Storage│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Capa | Tecnología |
|------|-------------|
| Frontend | Angular 21+, Signals, Tailwind CSS 4 |
| Backend | NestJS 11+, Drizzle ORM |
| Database | PostgreSQL 15+ |
| Cache/Queue | Redis 7+ |
| DevOps | Docker Compose |

## Patrones de Diseño

### Frontend

- **Componentes Standalone**: Sin NgModules
- **Gestión de Estado**: Angular Signals (signal, computed, effect)
- **Arquitectura**: Feature-Sliced Design
  - `core/` - Configuración global y servicios singleton
  - `shared/` - UI Kit y componentes reutilizables
  - `features/` - Módulos de dominio autónomos
  - `pages/` - Páginas globales públicas

### Backend

- **Arquitectura**: Modular (como NgModules)
- **Eventos**: EventEmitter nativo de NestJS
- **Colas**: BullMQ para jobs asíncronos
- **ORM**: Drizzle (moderno y ligero)

## Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| Cliente | Usuario que necesita servicios de impresión |
| Proveedor | Negocio de impresión registrado |
| Admin | Administrador del sistema |

## Modelo de Datos

Ver [Modelo de Datos](data-model.md)

## Servicios Principales

### Core Services (Frontend)

- `AuthService` - Autenticación y tokens
- `ThemeService` - Sistema de diseño (tema claro/oscuro)
- `UserService` - Usuario actual
- `NotificationService` - Notificaciones globales

### Backend Modules

- `AuthModule` - Autenticación
- `UsersModule` - Gestión de usuarios
- `OffersModule` - Ofertas de servicios
- `OrdersModule` - Pedidos
- `ChatModule` - Mensajería
- `PaymentsModule` - Pagos y prepago
- `InvoicesModule` - Facturación
- `StatsModule` - Estadísticas
- `NotificationsModule` - Notificaciones

---

**Relacionado**
- [Frontend Architecture](../frontend/ARCHITECTURE.md)
- [Backend Architecture](../backend/ARCHITECTURE.md)
- [API Overview](api.md)

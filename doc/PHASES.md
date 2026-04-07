# PrintX - Fases de Desarrollo

## Resumen del Proyecto

Plataforma digital para gestión de servicios de impresión que conecta clientes con negocios de impresión locales.

---

## Fase 1: Fundación

**Objetivo**: Configurar la base del proyecto

### Tareas

- [x] 1.1 Configurar proyecto NestJS con TypeScript
- [x] 1.2 Configurar proyecto Angular 21 con Tailwind CSS
- [ ] 1.3 Configurar Docker Compose (PostgreSQL, Redis) - para producción
- [ ] 1.4 Configurar estructura de carpetas del proyecto
- [ ] 1.5 Configurar Git y GitHub con workflow

---

## Fase 2: Autenticación

**Objetivo**: Sistema de auth completo

### Tareas

- [ ] 2.1 Backend: Módulo de usuarios y auth (JWT)
- [ ] 2.2 Frontend: AuthService en core (token management)
- [ ] 2.3 Frontend: Feature auth (login, register, forgot-password)
- [ ] 2.4 Guards y interceptors HTTP
- [ ] 2.5 Tests de autenticación

---

## Fase 3: Ofertas

**Objetivo**: Gestión de servicios de impresión

### Tareas

- [ ] 3.1 Backend: CRUD de ofertas
- [ ] 3.2 Frontend: Feature provider - gestión de ofertas
- [ ] 3.3 Frontend: Feature client - visualización de ofertas

---

## Fase 4: Pedidos

**Objetivo**: Sistema completo de pedidos

### Tareas

- [ ] 4.1 Backend: CRUD de pedidos con estados
- [ ] 4.2 Backend: Sistema de documentos (upload, download, delete)
- [ ] 4.3 Frontend: Feature client - crear pedido
- [ ] 4.4 Frontend: Feature provider - bandeja de pedidos
- [ ] 4.5 Sistema de archivos estilo WhatsApp

---

## Fase 5: Chat

**Objetivo**: Comunicación en tiempo real

### Tareas

- [ ] 5.1 Backend: WebSocket con Socket.io
- [ ] 5.2 Backend: Módulo de mensajes
- [ ] 5.3 Frontend: Componente de chat compartido
- [ ] 5.4 Integración con vistas de pedido

---

## Fase 6: Pagos y Facturación

**Objetivo**: Sistema financiero

### Tareas

- [ ] 6.1 Backend: Sistema de prepago
- [ ] 6.2 Backend: Registro de depósitos y verificación
- [ ] 6.3 Backend: Generación de facturas PDF
- [ ] 6.4 Frontend: Gestión de saldo prepago
- [ ] 6.5 Frontend: Panel de verificación de pagos (provider)
- [ ] 6.6 Frontend: Envío de facturas por WhatsApp

---

## Fase 7: Dashboard y Métricas

**Objetivo**: Estadísticas del proveedor

### Tareas

- [ ] 7.1 Backend: Endpoints de estadísticas
- [ ] 7.2 Frontend: Dashboard con gráficos
- [ ] 7.3 Frontend: Tabla de clientes principales
- [ ] 7.4 Frontend: Reportes descargables

---

## Fase 8: Notificaciones

**Objetivo**: Sistema de notificaciones

### Tareas

- [ ] 8.1 Backend: Módulo de notificaciones
- [ ] 8.2 Backend: Event emitter para dispara notificaciones
- [ ] 8.3 Frontend: Centro de notificaciones
- [ ] 8.4 Notificaciones en tiempo real (WebSocket)

---

## Fase 9: Pulido

**Objetivo**: Mejoras finales

### Tareas

- [ ] 9.1 Theme service - modo oscuro
- [ ] 9.2 Tests unitarios y de integración
- [ ] 9.3 Optimización de rendimiento
- [ ] 9.4 Documentación de API (Swagger)
- [ ] 9.5 Limpieza de código

---

## Dependencias entre Fases

```
Fase 1 (Fundación)
    │
    ▼
Fase 2 (Auth) ──────► Fase 3 (Ofertas)
    │                      │
    │                      ▼
    │                 Fase 4 (Pedidos)
    │                      │
    │                      ▼
    │                 Fase 5 (Chat)
    │                      │
    └──────────────────────┼──────────────────► Fase 6 (Pagos)
                           │                         │
                           │                         ▼
                           │                    Fase 7 (Dashboard)
                           │                         │
                           └─────────────────────────┼─────────► Fase 8 (Notificaciones)
                                                        │
                                                        ▼
                                                   Fase 9 (Pulido)
```

## Milestones GitHub

- **v0.1.0**: Proyecto configurado (Fase 1)
- **v0.2.0**: Autenticación completa (Fase 2)
- **v0.3.0**: Ofertas y pedidos básicos (Fase 3-4)
- **v0.4.0**: Chat y pagos (Fase 5-6)
- **v0.5.0**: Dashboard (Fase 7)
- **v1.0.0**: Release oficial (Fase 8-9)

---

**Creado**: Abril 2026
**Última actualización**: 2026-04-06

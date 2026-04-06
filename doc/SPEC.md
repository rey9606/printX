# PrintX — Sistema de Gestión de Servicios de Impresión

## Especificación Técnica Completa

---

## 1. Visión del Producto

**PrintX** es una plataforma digital que conecta clientes que necesitan servicios de impresión con negocios de impresión locales. El sistema facilita todo el flujo operativo: desde la solicitud del servicio hasta la entrega del producto terminado, incluyendo gestión de pagos, comunicación en tiempo real y seguimiento de pedidos.

### 1.1 Problema que Resuelve

Los clientes necesitan una forma conveniente de solicitar impresiones sin visitar físicamente el negocio. Los negocios de impresión requieren gestionar pedidos, clientes y facturación de manera eficiente. La comunicación deficiente entre cliente y proveedor mediante métodos tradicionales genera retrasos y malentendidos. La falta de visibilidad sobre el estado de los trabajos de impresión genera ansiedad en los clientes y pérdida de tiempo en consultas.

---

## 2. Roles de Usuario

El sistema contempla tres tipos de usuario con funcionalidades diferenciadas:

| Rol | Descripción | Responsabilidades |
|-----|-------------|-------------------|
| **Cliente** | Usuario final que necesita servicios de impresión | Crear pedidos, subir documentos, agendar citas, comunicarse con proveedores, gestionar pagos |
| **Proveedor** | Negocio de impresión registrado en la plataforma | Gestionar ofertas, recibir pedidos, comunicarse con clientes, generar facturas, visualizar métricas |
| **Admin** | Administrador del sistema | Gestionar proveedores, resolver disputas, visualizar estadísticas globales, configurar parámetros del sistema |

---

## 3. Arquitectura del Sistema

### 3.1 Diagrama de Arquitectura General

La plataforma sigue una arquitectura cliente-servidor con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Angular 21+)                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  Core   │  │ Shared  │  │Feature: │  │Feature:│          │
│  │(Config) │  │(UI/Lib) │  │ Client  │  │Provider│          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                 │
│  Features: Auth, Chat, Orders, Offers, Payments, Dashboard   │
│  (Todos son Standalone + Lazy Loaded)                         │
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
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │     EventEmitter (Domain Events) + BullMQ (Jobs)        │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │    Redis     │  │ Local Storage│         │
│  │  (Primary)   │  │  (Cache/Queue)│ │  (Files)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Patrón de Arquitectura

Se implementa una arquitectura basada en eventos (Event-Driven Architecture) utilizando el EventEmitter nativo de NestJS para emitir eventos del dominio. BullMQ gestiona el procesamiento asíncrono de tareas como el envío de notificaciones, limpieza de archivos temporales y agregación de estadísticas. Este patrón permite desacoplar la lógica de negocio y mejorar la escalabilidad del sistema.

---

## 4. Stack Tecnológico

### 4.1 Backend

| Tecnología | Propósito |
|------------|-----------|
| NestJS 11+ | Framework principal basado en TypeScript |
| PostgreSQL 15+ | Base de datos relacional principal |
| Redis 7+ | Almacenamiento en caché y gestión de colas |
| BullMQ | Procesamiento de jobs asíncronos |
| @nestjs/event-emitter | Sistema de eventos del dominio (native) |
| Drizzle ORM | ORM moderno y ligero (alternativa a TypeORM) |
| Class Validator | Validación de DTOs |
| Swagger/OpenAPI | Documentación automática de APIs |
| JWT + Passport | Autenticación y autorización |

### 4.2 Frontend

| Tecnología | Propósito |
|------------|-----------|
| Angular 21+ | Framework principal con soporte nativo para Signals |
| Angular Signals | Gestión de estado reactivo (signal, computed, effect) |
| Tailwind CSS 4 | Framework de estilos utility-first |
| Angular Router | Navegación y rutas con loadComponent |
| HttpClient (built-in) | Consumo de APIs REST (disponible por defecto en Angular 21) |
| Standalone Components | Arquitectura por defecto (sin NgModules) |
| pnpm | Gestor de paquetes |

### 4.3 DevOps

| Tecnología | Propósito |
|------------|-----------|
| Docker Compose | Orquestación de servicios |
| Nginx | Servidor web y proxy reverso |

---

## 5. Modelo de Datos

### 5.1 Entidades Principales

**Usuario (User)**

El usuario es la entidad central del sistema. Cada usuario tiene un rol específico que determina sus permisos y funcionalidades disponibles.

```
User
├── id: UUID (clave primaria)
├── email: string (único, requerido)
├── passwordHash: string
├── phone: string (requerido para notificaciones)
├── name: string
├── role: enum (CLIENT, PROVIDER, ADMIN)
├── avatarUrl: string (opcional)
├── isActive: boolean (default: true)
├── isVerified: boolean (default: false)
├── createdAt: timestamp
├── updatedAt: timestamp
└── providerProfile: ProviderProfile? (relación 1:1)
```

**Perfil de Proveedor (ProviderProfile)**

Información adicional específica para negocios de impresión.

```
ProviderProfile
├── id: UUID
├── userId: UUID (FK -> User)
├── businessName: string
├── address: string
├── description: string (opcional)
├── logoUrl: string (opcional)
├── workingHours: JSON ({ monday: {open: "08:00", close: "18:00"}, ...})
├── rating: decimal (default: 0)
├── totalJobs: integer (default: 0)
├── isActive: boolean (default: true)
└── createdAt: timestamp
```

**Oferta de Servicio (Offer)**

Cada proveedor puede crear múltiples ofertas de servicios de impresión.

```
Offer
├── id: UUID
├── providerId: UUID (FK -> User)
├── title: string
├── description: string
├── type: enum (DOCUMENT, IMAGE, SCAN, COPY, BINDING, OTHER)
├── basePrice: decimal
├── pricePerPage: decimal (opcional)
├── pricePerUnit: decimal (opcional)
├── isActive: boolean (default: true)
├── conditions: JSON (opcional, condiciones adicionales)
├── createdAt: timestamp
└── updatedAt: timestamp
```

**Pedido (Order)**

Representa una solicitud de servicio de impresión realizada por un cliente.

```
Order
├── id: UUID
├── clientId: UUID (FK -> User)
├── providerId: UUID (FK -> User)
├── offerId: UUID (FK -> Offer)
├── status: enum (PENDING, CONFIRMED, IN_PROGRESS, READY, COMPLETED, CANCELLED)
├── quantity: integer
├── totalPages: integer
├── instructions: text (opcional)
├── baseAmount: decimal
├── totalAmount: decimal
├── scheduledDate: date (opcional)
├── scheduledTime: time (opcional)
├── isPaid: boolean (default: false)
├── paymentMethod: enum (TRANSFER, CASH, PREPAID, opcionales)
├── paymentReference: string (opcional)
├── paidAt: timestamp (opcional)
├── completedAt: timestamp (opcional)
├── createdAt: timestamp
├── updatedAt: timestamp
└── documents: OrderDocument[] (relación 1:N)
```

**Documento del Pedido (OrderDocument)**

Archivos adjuntos por el cliente para imprimir.

```
OrderDocument
├── id: UUID
├── orderId: UUID (FK -> Order)
├── fileName: string
├── originalName: string
├── filePath: string
├── fileSize: bigint
├── mimeType: string
├── status: enum (UPLOADED, DOWNLOADED, DELETED)
├── downloadedAt: timestamp (opcional)
├── deletedAt: timestamp (opcional)
└── createdAt: timestamp
```

**Mensaje de Chat (ChatMessage)**

Mensajes del chat entre cliente y proveedor.

```
ChatMessage
├── id: UUID
├── orderId: UUID (FK -> Order)
├── senderId: UUID (FK -> User)
├── content: text
├── type: enum (TEXT, FILE, SYSTEM)
├── isRead: boolean (default: false)
├── readAt: timestamp (opcional)
└── createdAt: timestamp
```

**Factura (Invoice)**

Documento fiscal generado por el proveedor.

```
Invoice
├── id: UUID
├── orderId: UUID (FK -> Order)
├── invoiceNumber: string (único, formato: INV-YYYYMMDD-XXXX)
├── issuedAt: timestamp
├── subtotal: decimal
├── tax: decimal
├── total: decimal
├── status: enum (DRAFT, ISSUED, SENT, PAID)
├── paymentMethod: string
├── notes: text (opcional)
├── pdfPath: string (opcional)
└── createdAt: timestamp
```

**Notificación (Notification)**

Sistema de notificaciones in-app.

```
Notification
├── id: UUID
├── userId: UUID (FK -> User)
├── title: string
├── message: string
├── type: enum (ORDER_STATUS, PAYMENT, CHAT, SYSTEM, INVOICE)
├── isRead: boolean (default: false)
├── data: JSON (opcional, datos adicionales)
├── createdAt: timestamp
```

**Saldo Prepago (PrepaidBalance)**

Sistema de crédito prepago para clientes.

```
PrepaidBalance
├── id: UUID
├── userId: UUID (FK -> User, único)
├── amount: decimal (default: 0)
├── createdAt: timestamp
└── updatedAt: timestamp
```

**Transacción Prepago (PrepaidTransaction)**

Historial de movimientos de saldo prepago.

```
PrepaidTransaction
├── id: UUID
├── balanceId: UUID (FK -> PrepaidBalance)
├── type: enum (DEPOSIT, ORDER_PAYMENT, REFUND, BONUS)
├── amount: decimal
├── reference: string (opcional, referencia de transferencia)
├── status: enum (PENDING, COMPLETED, REJECTED, CANCELLED)
├── createdAt: timestamp
```

---

## 6. Especificación de Funcionalidades

### 6.1 Módulo de Autenticación

**Funcionalidades:**

- Registro de usuarios con validación de email
- Login con email y contraseña
- JWT con refresh tokens para sesión persistente
- Recuperación de contraseña mediante enlace por email
- Verificación de teléfono mediante código OTP (futuro)

**Endpoints:**

```
POST   /auth/register     → Registrar nuevo usuario
POST   /auth/login        → Iniciar sesión
POST   /auth/refresh      → Renovar token de acceso
POST   /auth/logout      → Cerrar sesión
POST   /auth/forgot-password  → Solicitar recuperación
POST   /auth/reset-password   → Restablecer contraseña
GET    /auth/me          → Obtener usuario actual
```

### 6.2 Módulo de Ofertas

**Funcionalidades del Proveedor:**

- Crear nuevas ofertas de servicios
- Editar ofertas existentes
- Activar o desactivar ofertas
- Definir precios base y precios por página o unidad
- Agregar condiciones especiales del servicio
- Categorizar ofertas por tipo de servicio

**Funcionalidades del Cliente:**

- Ver todas las ofertas disponibles
- Filtrar ofertas por proveedor
- Ver detalles de cada oferta
- Comparar ofertas entre proveedores

**Endpoints:**

```
GET    /offers                           → Listar ofertas públicas
GET    /offers/:id                       → Ver detalles de oferta
GET    /offers/provider/:providerId     → Ofertas de un proveedor
POST   /offers                           → Crear oferta (proveedor)
PUT    /offers/:id                      → Editar oferta (proveedor)
DELETE /offers/:id                      → Eliminar oferta (proveedor)
```

### 6.3 Módulo de Pedidos

**Flujo de Estados del Pedido:**

```
┌──────────┐    ┌────────────┐    ┌───────────┐    ┌────────┐    ┌───────────┐
│ PENDING  │───▶│ CONFIRMED  │───▶│IN_PROGRESS│───▶│ READY  │───▶│COMPLETED │
└──────────┘    └────────────┘    └───────────┘    └────────┘    └───────────┘
     │                                              │
     ▼                                              ▼
┌──────────┐                                  ┌────────────┐
│ CANCELLED│                                  │  INVOICE   │
└──────────┘                                  └────────────┘
```

**Funcionalidades del Cliente:**

- Crear pedido seleccionando una oferta
- Adjuntar documentos mediante interfaz de upload
- Agregar instrucciones especiales
- Agendar fecha y hora para entrega presencial
- Cancelar pedido si está en estado PENDING
- Subir documentos mediante WebSocket para archivos grandes
- Cancelar pedido antes de confirmación del proveedor

**Funcionalidades del Proveedor:**

- Ver bandeja de pedidos pendientes
- Filtrar pedidos por estado
- Aceptar o rechazar nuevos pedidos
- Actualizar estado del pedido
- Descargar documentos adjuntos
- Notificar al cliente cuando el trabajo está listo

**Sistema de Archivos Estilo WhatsApp:**

El sistema implementa un mecanismo de almacenamiento temporal para optimizar el uso de espacio:

1. El cliente sube el archivo al servidor, donde se almacena temporalmente
2. Cuando el proveedor se conecta y descarga el archivo, este se elimina del servidor
3. El archivo queda almacenado de forma local en el dispositivo del cliente y en el dispositivo del proveedor
4. Si el proveedor no descarga el archivo en 24 horas, se elimina automáticamente del servidor
5. El sistema justifica esto como una medida de privacidad y reducción de responsabilidad

**Endpoints:**

```
POST   /orders                    → Crear nuevo pedido
GET    /orders                   → Listar pedidos del usuario
GET    /orders/:id               → Ver detalles del pedido
PUT    /orders/:id/status       → Actualizar estado (proveedor)
DELETE /orders/:id               → Cancelar pedido (cliente, solo PENDING)
POST   /orders/:id/documents     → Subir documento al pedido
GET    /orders/:id/documents     → Listar documentos del pedido
POST   /orders/:id/schedule      → Agendar cita de entrega
```

### 6.4 Módulo de Chat

**Funcionalidades:**

- Chat en tiempo real mediante WebSocket
- Un hilo de conversación por cada pedido
- Envío de mensajes de texto
- Envío de archivos (imágenes, documentos pequeños)
- Indicador de mensaje leído
- Notificaciones push cuando el usuario está desconectado
- Indicador de "escribiendo..."

**Eventos WebSocket:**

```
chat:message    → Nuevo mensaje recibido
chat:typing     → Usuario está escribiendo
chat:read       → Mensaje marcado como leído
```

**Endpoints:**

```
GET    /chat/order/:orderId    → Obtener historial de mensajes
POST   /chat/order/:orderId    → Enviar nuevo mensaje
PUT    /chat/:messageId/read  → Marcar mensaje como leído
```

### 6.5 Módulo de Facturación

**Funcionalidades:**

- Generación automática de factura al completar pedido
- Datos fiscales del proveedor (nombre, dirección, NIT)
- Datos del cliente
- Detalle del servicio prestado con precios
- Cálculo de impuestos
- Envío de factura mediante:
  - Notificación in-app
  - Email
  - WhatsApp mediante enlace wa.me
- Descarga de PDF de factura
- Compartir factura por WhatsApp

**Endpoints:**

```
GET    /invoices/:id                → Ver factura
GET    /invoices/order/:orderId    → Obtener factura del pedido
POST   /invoices                    → Crear factura
PUT    /invoices/:id               → Editar factura
GET    /invoices/:id/pdf           → Descargar PDF de factura
POST   /invoices/:id/send          → Enviar factura al cliente
```

### 6.6 Módulo de Pagos

**Sistema de Prepago (Prepaid):**

El sistema implementa un mecanismo de crédito prepago que permite al cliente depositing fondos y utilizarlos automáticamente en sus pedidos:

1. El cliente realiza un depósito mediante transferencia bancaria
2. El sistema registra la referencia de transferencia
3. Un administrador o el proveedor verifica el depósito
4. El saldo se acredita en la cuenta del cliente
5. Al confirmar un pedido, el sistema deduce automáticamente del saldo prepago

**Gestión de Pagos por Transferencia:**

Dado que la integración con TransferMovel es compleja, el sistema no procesa pagos directamente. En su lugar:

- El cliente proporciona la referencia de transferencia
- El sistema registra el pago como PENDING
- El proveedor o admin verifica manualmente el depósito
- Una vez verificado, el pedido se marca como pagado
- El sistema soporta pagos en efectivo directamente en el negocio

**Endpoints:**

```
GET    /payments/balance           → Consultar saldo prepago
POST   /payments/deposit          → Registrar depósito
GET    /payments/transactions    → Ver historial de transacciones
POST   /payments/refund           → Solicitar reembolso
GET    /payments/pending          → Ver pagos pendientes (proveedor)
PUT    /payments/:id/verify       → Verificar pago (proveedor/admin)
```

### 6.7 Módulo de Notificaciones

**Tipos de Notificaciones:**

| Tipo | Evento Disparador | Destinatario |
|------|-------------------|---------------|
| ORDER_STATUS | Cambio de estado del pedido | Cliente |
| PAYMENT_RECEIVED | Depósito verificado | Proveedor |
| PAYMENT_REJECTED | Pago rechazado | Cliente |
| NEW_MESSAGE | Nuevo mensaje en chat | Receptor |
| ORDER_READY | Pedido listo para entrega | Cliente |
| ORDER_CONFIRMED | Pedido confirmado por proveedor | Cliente |
| INVOICE_SENT | Nueva factura emitida | Cliente |

**Canales de Notificación:**

- Notificaciones in-app (persistentes)
- WebSocket para推送 en tiempo real
- Email (implementación futura)

### 6.8 Módulo de Estadísticas y Dashboard

**Métricas del Dashboard del Proveedor:**

El dashboard presenta visualizations completas del rendimiento del negocio:

```
┌────────────────────────────────────────────────────────────────┐
│                     DASHBOARD DEL PROVEEDOR                   │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Pedidos Este │ Ingresos Este│ Valor Prom.  │ Tasa de           │
│ Mes          │ Mes          │ por Pedido   │ Completación      │
│    45       │   $1,250     │    $27.78    │     92%           │
├──────────────┴──────────────┴──────────────┴───────────────────┤
│                                                                │
│  Pedidos por Estado (Gráfico Dona)                            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                    │
│  │ 15% │ │ 25% │ │ 30% │ │ 20% │ │ 10% │                    │
│  │Pendi│ │Conf │ │Prog │ │Listo│ │Done │                    │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                    │
│                                                                │
│  Tendencia de Ingresos (Últimos 6 meses)                      │
│  ┌──────────────────────────────────────────────────────────  │
│  │ $500                                                         █                                         │
│  │ $400                                                   █     █                                          │
│  │ $300                             █                 █     █     █                                         │
│  │ $200                       █     █           █     █     █     █      █                                  │
│  │ $100                 █     █     █     █     █     █     █     █      █                                  │
│  │ $0    █        █     █     █     █     █     █     █     █     █      █                                  │
│  └──────────────────────────────────────────────────────────  │
│       Ene   Feb   Mar   Abr   May   Jun                                           │
│                                                                │
│  Clientes Principales (Tabla)                                │
│  ┌────────────────────────────────────────────────────────   │
│  │ Cliente         │ Pedidos │ Gastado  │ Último Pedido  │    │
│  │─────────────────│─────────│──────────│────────────────│    │
│  │ Juan Pérez      │   12    │  $450    │   15 Jun 2024  │    │
│  │ María García    │    8    │  $320    │   10 Jun 2024  │    │
│  └────────────────────────────────────────────────────────   │
│                                                                │
│  Trabajos por Tipo (Gráfico de Barras)                       │
│  ┌────────────────────────────────────────────────────────   │
│  │ Documentos:   ██████████████████ (65%)                   │
│  │ Imágenes:     ████████████ (25%)                         │
│  │ Escaneo:      █████ (7%)                                  │
│  │ Copias:       ███ (3%)                                    │
│  └────────────────────────────────────────────────────────   │
└────────────────────────────────────────────────────────────────┘
```

**Endpoints:**

```
GET /stats/provider/:providerId/overview      → Resumen general
GET /stats/provider/:providerId/revenue      → Ingresos por período
GET /stats/provider/:providerId/orders-by-status  → Distribución por estado
GET /stats/provider/:providerId/orders-by-type     → Distribución por tipo
GET /stats/provider/:providerId/top-clients        → Mejores clientes
GET /stats/provider/:providerId/trend             → Tendencia histórica
```

---

## 7. Arquitectura de Eventos

### 7.1 Eventos del Dominio

El sistema utiliza el EventEmitter nativo de NestJS (`@nestjs/event-emitter`) para implementar un patrón de arquitectura basada en eventos:

```typescript
// Domain Events
export enum DomainEvent {
  ORDER_CREATED = 'order.created',
  ORDER_STATUS_CHANGED = 'order.status.changed',
  ORDER_DOCUMENT_UPLOADED = 'order.document.uploaded',
  ORDER_DOCUMENT_DOWNLOADED = 'order.document.downloaded',
  ORDER_DOCUMENT_DELETED = 'order.document.deleted',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_VERIFIED = 'payment.verified',
  PAYMENT_REJECTED = 'payment.rejected',
  INVOICE_ISSUED = 'invoice.issued',
  INVOICE_SENT = 'invoice.sent',
  CHAT_MESSAGE_SENT = 'chat.message.sent',
  CHAT_MESSAGE_READ = 'chat.message.read',
}
```

### 7.2 Flujo de Eventos

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Action    │────▶│   Service    │────▶│  EventEmitter  │
│ (Controller)│     │  (Business)  │     │  .emit()        │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────┐
                              │       EVENT HANDLERS            │
                              │  ┌──────────┐ ┌──────────────┐ │
                              │  │Notifiers │ │  BullMQ Jobs │ │
                              │  └──────────┘ └──────────────┘ │
                              └─────────────────────────────────┘
```

### 7.3 BullMQ Jobs

El sistema configura los siguientes jobs para procesamiento asíncrono:

| Job | Descripción | Programación |
|-----|-------------|--------------|
| SendNotificationJob | Envía notificaciones push | Inmediato |
| CleanupFilesJob | Limpia archivos no descargados | Cada 6 horas |
| ReminderPendingJob | Recordatorios de pedidos pendientes | Diario |
| InvoiceReminderJob | Recordatorios de facturas impagas | Diario |
| StatsAggregationJob | Agrega estadísticas diarias | Diario |

---

## 8. Arquitectura Frontend

### 8.1 Estructura de Carpetas

La estructura sigue el patrón de **Feature-Sliced Design** adaptado a Angular: cada feature es un módulo autónomo con su propia estructura interna, encapsulando todo lo que pertenece a esa funcionalidad. Los layouts van en shared, no en cada feature.

```
src/
├── app/
│   ├── core/                             # Configuración y servicios globales
│   │   ├── config/                       # Environment y configuración
│   │   ├── interceptors/                 # HTTP interceptors globales
│   │   ├── guards/                       # Guards de ruta globales
│   │   └── services/                     # Servicios singleton globales
│   │
│   ├── shared/                           # UI Kit y layouts globales
│   │   ├── ui/                           # Componentes atómicos (Button, Input, Card, Modal)
│   │   ├── layout/                       # Layouts base
│   │   │   ├── public.layout.ts          # Layout público
│   │   │   ├── auth.layout.ts            # Layout para auth
│   │   │   ├── client.layout.ts          # Layout para cliente
│   │   │   └── provider.layout.ts        # Layout para proveedor
│   │   ├── directives/                  # Directivas reutilizables
│   │   ├── pipes/                        # Pipes reutilizables
│   │   └── models/                       # Interfaces compartidas
│   │
│   ├── features/                         # Features autonomous (como NgModules)
│   │   ├── auth/
│   │   │   ├── auth.routes.ts            # Rutas del feature
│   │   │   ├── components/               # Componentes específicos del feature
│   │   │   │   ├── login-form/
│   │   │   │   ├── register-form/
│   │   │   │   └── forgot-password/
│   │   │   ├── views/                    # Vistas de página
│   │   │   │   ├── login.page.ts
│   │   │   │   ├── register.page.ts
│   │   │   │   └── forgot-password.page.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── client/
│   │   │   ├── client.routes.ts
│   │   │   ├── services/
│   │   │   │   ├── client-order.service.ts
│   │   │   │   └── prepaid.service.ts
│   │   │   ├── components/
│   │   │   │   ├── order-card/
│   │   │   │   ├── document-uploader/
│   │   │   │   └── scheduler/
│   │   │   └── views/
│   │   │   │   ├── offers.page.ts
│   │   │   │   ├── orders.page.ts
│   │   │   │   ├── create-order.page.ts
│   │   │   │   ├── history.page.ts
│   │   │   │   └── prepaid.page.ts
│   │   │
│   │   ├── provider/
│   │   │   ├── provider.routes.ts
│   │   │   ├── services/
│   │   │   │   ├── provider-order.service.ts
│   │   │   │   ├── stats.service.ts
│   │   │   │   └── invoice.service.ts
│   │   │   ├── components/
│   │   │   │   ├── order-card/
│   │   │   │   ├── offer-editor/
│   │   │   │   └── stats-chart/
│   │   │   └── views/
│   │   │   │   ├── dashboard.page.ts
│   │   │   │   ├── orders.page.ts
│   │   │   │   ├── offers.page.ts
│   │   │   │   ├── invoices.page.ts
│   │   │   │   └── payments.page.ts
│   │   │
│   │   └── admin/
│   │       ├── admin.routes.ts
│   │       └── ...
│   │
│   ├── pages/                            # Páginas globales públicas
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

### 8.2 Estructura Interna de un Feature

Cada feature sigue una estructura consistente que encapsula todo lo que pertenece a esa funcionalidad:

```
feature-name/
├── feature-name.routes.ts           # Rutas child del feature
├── services/                        # Servicios específicos del feature
│   ├── feature.service.ts
│   └── feature.store.ts            # Store con signals (si aplica)
├── components/                      # Componentes internos del feature
│   ├── component-a/
│   │   ├── component-a.ts
│   │   └── component-a.html
│   └── component-b/
├── views/                          # Vistas de página
│   ├── view-name.page.ts
│   └── view-name.page.html
└── index.ts                        # Exports públicos del feature
```
src/
├── app/
│   ├── core/                             # Lógica de negocio global (Singletons)
│   │   ├── config/                        # Environment y configuración
│   │   ├── interceptors/                  # HTTP interceptors (Logging, Auth, Errores)
│   │   ├── guards/                        # Guards de ruta (Auth, Roles)
│   │   ├── services/                      # Servicios singleton (API, State global)
│   │   │   ├── auth.service.ts           # Lógica global de auth (JWT, tokens)
│   │   │   ├── user.service.ts           # Usuario actual
│   │   │   ├── theme.service.ts          # Sistema de diseño (tema, colores)
│   │   │   └── notification.service.ts   # Notificaciones globales
│   │   └── theme/                         # Sistema de diseño
│   │       ├── design-tokens.ts           # Tokens de diseño (colores, spacing)
│   │       ├── themes.ts                 # Definición de temas
│   │       └── theme.config.ts            # Configuración global
│   │
│   ├── shared/                           # Componentes y utilidades reutilizables
│   │   ├── components/
│   │   │   ├── ui/                        # UI Kit (Buttons, Inputs, Cards, Modals)
│   │   │   ├── layout/                    # Header, Footer, Sidebar, Navbar
│   │   │   ├── chat/                      # Componentes de chat reutilizables
│   │   │   └── loading/                   # Spinners, Skeletons
│   │   ├── directives/                   # Directivas personalizadas
│   │   ├── pipes/                        # Pipes para transformación de datos
│   │   ├── models/                       # Interfaces y tipos TypeScript
│   │   └── utils/                        # Funciones utilitarias
│   │
│   ├── features/                         # Módulos de dominio (Lazy Loaded)
│   │   ├── auth/                         # Autenticación y registro
│   │   │   ├── views/                    # Vistas: login, register, forgot-password
│   │   │   ├── components/               # Componentes específicos de auth
│   │   │   └── auth.routes.ts             # Rutas específicas
│   │   │
│   │   ├── client/                       # Funcionalidades del cliente
│   │   │   ├── views/
│   │   │   │   ├── offers/                # Ver ofertas disponibles
│   │   │   │   ├── orders/                # Mis pedidos
│   │   │   │   ├── create-order/          # Crear nuevo pedido
│   │   │   │   ├── schedule/              # Agendar cita
│   │   │   │   ├── history/                # Historial de trabajos
│   │   │   │   └── prepaid/                # Gestión de saldo prepago
│   │   │   └── client.routes.ts
│   │   │
│   │   ├── provider/                     # Funcionalidades del proveedor
│   │   │   ├── views/
│   │   │   │   ├── dashboard/              # Dashboard con métricas
│   │   │   │   ├── offers/                 # Crear/gestionar ofertas
│   │   │   │   ├── orders/                # Bandeja de pedidos
│   │   │   │   ├── chat/                  # Chat con clientes
│   │   │   │   ├── invoices/              # Gestionar facturas
│   │   │   │   └── payments/              # Verificar pagos
│   │   │   └── provider.routes.ts
│   │   │
│   │   ├── chat/                         # Componente de chat compartido
│   │   ├── notifications/                # Centro de notificaciones
│   │   └── admin/                        # Funcionalidades de admin
│   │
│   ├── pages/                            # Páginas globales (no lazy loaded)
│   │   ├── home/                        # Landing page pública
│   │   ├── not-found/                   # Página 404
│   │   ├── server-error/                # Página 500
│   │   └── maintenance/                # Página de mantenimiento
│   │
│   ├── app.component.ts                 # Componente raíz
│   ├── app.config.ts                    # Configuración global (providers)
│   └── app.routes.ts                    # Rutas principales
│
├── assets/                              # Imágenes, iconos, fuentes
└── styles.scss                          # Estilos globales y Tailwind
```

### 8.2 Estructura Interna de un Feature

Cada feature sigue una estructura consistente que encapsula todo lo que pertenece a esa funcionalidad:

```
feature-name/
├── feature-name.routes.ts           # Rutas child del feature
├── services/                        # Servicios específicos del feature
│   ├── feature.service.ts
│   └── feature.store.ts            # Store con signals (si aplica)
├── components/                      # Componentes internos del feature
│   ├── component-a/
│   │   ├── component-a.ts
│   │   └── component-a.html
│   └── component-b/
├── views/                          # Vistas de página
│   ├── view-name.page.ts
│   └── view-name.page.html
└── index.ts                        # Exports públicos del feature
```

### 8.3 Layouts en Shared

Los layouts son componentes globales definidos en `shared/layout/` y se usan en las rutas de cada feature:

```typescript
// shared/layout/provider.layout.ts
@Component({
  selector: 'app-provider-layout',
  standalone: true,
  imports: [RouterOutlet, ProviderSidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <app-provider-sidebar />
      <div class="flex-1 flex flex-col">
        <app-header />
        <main class="flex-1 p-6 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ProviderLayout {}
```

**Uso en las rutas del feature:**

```typescript
// features/provider/provider.routes.ts
export const PROVIDER_ROUTES: Routes = [
  {
    path: '',
    component: ProviderLayout,          // Usa layout de shared
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./views/dashboard.page').then(m => m.DashboardPage) },
      { path: 'orders', loadComponent: () => import('./views/orders.page').then(m => m.OrdersPage) },
      { path: 'offers', loadComponent: () => import('./views/offers.page').then(m => m.OffersPage) },
      { path: 'invoices', loadComponent: () => import('./views/invoices.page').then(m => m.InvoicesPage) },
      { path: 'payments', loadComponent: () => import('./views/payments.page').then(m => m.PaymentsPage) },
    ]
  }
];
```

### 8.4 Auth: Core vs Feature

La autenticación tiene lógica distribuida entre **core** (singletons) y **feature** (UI):

#### Core: Auth Service Global (core/services/auth.service.ts)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Token management (singleton - disponible globalmente)
  private token = signal<string | null>(null);
  private user = signal<I_User | null>(null);
  
  readonly isAuthenticated = computed(() => !!this.token());
  readonly currentUser = this.user.asReadonly();
  
  async login(email: string, password: string): Promise<void> {
    const response = await this.http.post<AuthResponse>('/auth/login', { email, password });
    this.token.set(response.accessToken);
    this.user.set(response.user);
    this.saveToken(response.accessToken);
  }
  
  logout() {
    this.token.set(null);
    this.user.set(null);
    this.clearToken();
  }
  
  private saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }
}
```

#### Feature Auth: UI y flows (features/auth/)

El feature de auth solo maneja la **UI** (formularios, páginas):

```
features/auth/
├── auth.routes.ts           # Rutas: /login, /register, /forgot-password
├── components/
│   ├── login-form/          # Formulario de login
│   ├── register-form/       # Formulario de registro
│   └── forgot-password/     # Recuperación de contraseña
└── views/
    ├── login.page.ts        # Página de login
    ├── register.page.ts    # Página de registro
    └── forgot-password.page.ts
```

**Nota**: El feature auth **no** tiene servicios propios. Usa `AuthService` de core.

### 8.5 Patrones de Diseño Angular 21

#### 8.5.1 Componentes Standalone
- **Todos los componentes son standalone** - no se utilizan NgModules
- Se importan directamente en el componente padre o en el arreglo de rutas (`loadComponent`)
- **Change Detection**: Siempre `OnPush` para optimizar el rendimiento

#### 8.5.2 Gestión de Estado con Signals
- Uso exclusivo de `signal()`, `computed()` y `effect()` para estado reactivo
- **Regla**: No usar `mutate`, usar `update` o `set`
- Evitar RxJS para estado local (usar `toObservable` o `toSignal` solo si es necesario para interoperabilidad)

```typescript
// Ejemplo: OrderStore con signals puros
@Injectable({ providedIn: 'root' })
export class OrderStore {
  // State signals (privados)
  private orders = signal<Order[]>([]);
  private isLoading = signal<boolean>(false);

  // Computed signals (derivados) - solo lectura
  readonly pendingOrders = computed(() =>
    this.orders().filter(o => o.status === 'PENDING')
  );

  readonly totalRevenue = computed(() =>
    this.orders()
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  );

  // Exponer solo lectura
  readonly allOrders = this.orders.asReadonly();
  readonly loading = this.isLoading.asReadonly();

  // Actions (métodos que modifican el estado)
  async loadOrders() {
    this.isLoading.set(true);
    try {
      const orders = await this.orderService.getOrders();
      this.orders.set(orders);
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

#### 8.5.3 Inyección de Dependencias
- Uso del patrón `inject()` dentro de constructores o funciones `inject()`
- Servicios globales en `core/services` con `providedIn: 'root'`

```typescript
//新旧对比
// ❌ Old way
constructor(private http: HttpClient, private store: OrderStore) {}

// ✅ New way (Angular 21)
private http = inject(HttpClient);
private store = inject(OrderStore);
```

#### 8.5.4 Control de Flujo en Plantillas
- Uso de sintaxis nativa de Angular: `@if`, `@for`, `@switch`
- Evitar directivas estructurales antiguas (`*ngIf`, `*ngFor`)

```html
<!-- ❌ Old -->
<div *ngIf="orders.length > 0">
  <div *ngFor="let order of orders">{{ order.id }}</div>
</div>

<!-- ✅ New (Angular 17+) -->
@if (orders().length > 0) {
  @for (order of orders(); track order.id) {
    <div>{{ order.id }}</div>
  }
}
```

#### 8.5.5 Nomenclatura y Conventions
- **Interfaces**: Prefijo `I_` (ej. `I_User`, `I_Order`)
- **Clases**: `PascalCase`
- **Variables**: `camelCase`
- **Constantes**: `SCREAMING_SNAKE_CASE`
- **Señales**: sufijo `()` al leer (ej. `orders()`, `isLoading()`)

#### 8.5.6 Rutas y Alias (tsconfig.json)
Configurar alias para evitar rutas relativas largas:

```json
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

#### 8.5.7 Routing con loadComponent

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.routes')
      .then(m => m.CLIENT_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] }
  },
  {
    path: 'provider',
    loadChildren: () => import('./features/provider/provider.routes')
      .then(m => m.PROVIDER_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PROVIDER'] }
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
```
src/
├── app/
│   ├── core/                             # Configuración central
│   │   ├── config/                       # Configuración de environment
│   │   ├── interceptors/                 # HTTP interceptors
│   │   ├── guards/                       # Guards de autenticación
│   │   ├── services/                     # Servicios singleton
│   │   └── core.module.ts
│   │
│   ├── shared/                           # Componentes y utilidades compartidas
│   │   ├── components/
│   │   │   ├── ui/                       # Componentes UI básicos (botones, inputs, cards)
│   │   │   ├── layout/                  # Header, footer, sidebar, navbar
│   │   │   ├── chat/                     # Componentes de chat reutilizables
│   │   │   └── loading/                  # Spinners, skeletons
│   │   ├── directives/                  # Directivas personalizadas
│   │   ├── pipes/                        # Pipes personalizados
│   │   ├── models/                       # Interfaces y tipos TypeScript
│   │   ├── utils/                        # Funciones utilitarias
│   │   └── shared.module.ts
│   │
│   ├── features/                        # Módulos por característica
│   │   ├── auth/                        # Login, registro, recuperación
│   │   ├── client/
│   │   │   ├── offers/                  # Ver y buscar ofertas
│   │   │   ├── orders/                  # Lista de mis pedidos
│   │   │   ├── create-order/            # Crear nuevo pedido
│   │   │   ├── schedule/                # Agendar cita de entrega
│   │   │   ├── history/                 # Historial de trabajos
│   │   │   ├── prepaid/                 # Gestión de saldo prepago
│   │   │   └── client-routing.module.ts
│   │   │
│   │   ├── provider/
│   │   │   ├── dashboard/               # Dashboard con métricas
│   │   │   ├── offers/                  # Crear y gestionar ofertas
│   │   │   ├── orders/                  # Bandeja de pedidos
│   │   │   ├── chat/                    # Chat con clientes
│   │   │   ├── invoices/                # Gestionar facturas
│   │   │   ├── payments/                # Verificar pagos
│   │   │   └── provider-routing.module.ts
│   │   │
│   │   ├── chat/                        # Componente de chat compartido
│   │   ├── notifications/               # Centro de notificaciones
│   │   └── admin/                       # Funcionalidades de admin
│   │
│   ├── pages/                           # Páginas de rutas de primer nivel
│   │   ├── home/                       # Página de inicio
│   │   ├── not-found/                  # Página 404
│   │   ├── server-error/               # Página 500
│   │   └── unauthorized/               # Página 401
│   │
│   ├── app.component.ts                # Componente raíz
│   ├── app.config.ts                   # Configuración de la aplicación
│   └── app.routes.ts                   # Rutas principales
│
├── assets/                             # Imágenes, iconos, fuentes
├── styles/                             # Estilos globales y Tailwind
│   └── styles.scss
└── environments/                       # Archivos de environment
    ├── environment.ts
    └── environment.prod.ts
```

### 8.2 Gestión de Estado con Signals

Angular Signals proporciona una forma reactiva y moderna de gestionar el estado. A continuación se muestra un ejemplo de implementación:

```typescript
@Injectable({ providedIn: 'root' })
export class OrderStore {
  // State signals (estado privado)
  private orders = signal<Order[]>([]);
  private currentOrder = signal<Order | null>(null);
  private isLoading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Computed signals (derivados)
  readonly pendingOrders = computed(() => 
    this.orders().filter(o => o.status === 'PENDING')
  );
  
  readonly completedOrders = computed(() => 
    this.orders().filter(o => o.status === 'COMPLETED')
  );
  
  readonly totalRevenue = computed(() => 
    this.orders()
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  );

  // Public read-only signals
  readonly allOrders = this.orders.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  
  // Actions (métodos que modifican el estado)
  async loadOrders() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const orders = await this.orderService.getOrders();
      this.orders.set(orders);
    } catch (e) {
      this.error.set(e.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createOrder(data: CreateOrderDto) {
    this.isLoading.set(true);
    try {
      const order = await this.orderService.createOrder(data);
      this.orders.update(orders => [...orders, order]);
      return order;
    } catch (e) {
      this.error.set(e.message);
      throw e;
    } finally {
      this.isLoading.set(false);
    }
  }

  updateOrderStatus(id: string, status: OrderStatus) {
    this.orders.update(orders => 
      orders.map(o => o.id === id ? { ...o, status } : o)
    );
  }
}
```

### 8.3 Sistema de Diseño y Theme Service

El sistema de diseño está centralizado en `core/` con Theme Service para gestionar temas (claro/oscuro) y tokens de diseño reutilizables.

#### 8.3.1 Theme Service (core/services/theme.service.ts)

```typescript
// Sistema de diseño centralizado
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme = signal<'light' | 'dark'>('light');
  
  readonly theme = this.currentTheme.asReadonly();
  readonly isDark = computed(() => this.currentTheme() === 'dark');
  
  toggleTheme() {
    this.currentTheme.update(t => t === 'light' ? 'dark' : 'light');
    this.applyTheme();
  }
  
  private applyTheme() {
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
```

#### 8.3.2 Design Tokens (core/theme/design-tokens.ts)

```typescript
// Tokens de diseño centralizados
export const DESIGN_TOKENS = {
  colors: {
    // CMYK-inspired palette
    cyan: { DEFAULT: '#00B4D8', light: '#90E0EF', dark: '#0077B6' },
    magenta: { DEFAULT: '#E83E8C', light: '#F4B6D0', dark: '#C2185B' },
    yellow: { DEFAULT: '#FFD60A', light: '#FFE066', dark: '#E6B800' },
    black: { DEFAULT: '#212529', light: '#495057' },
    
    // Primary (Cyan + Magenta blend = Purple)
    primary: { DEFAULT: '#7B2CBF', light: '#9D4EDD', dark: '#5A189A' },
    secondary: { DEFAULT: '#2D6A4F', light: '#40916C', dark: '#1B4332' },
    
    // Semantic
    success: { DEFAULT: '#10B981', light: '#D1FAE5' },
    warning: { DEFAULT: '#F59E0B', light: '#FEF3C7' },
    error: { DEFAULT: '#EF4444', light: '#FEE2E2' },
    info: { DEFAULT: '#3B82F6', light: '#DBEAFE' },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  borderRadius: { sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' },
  shadows: { sm: '0 1px 2px', md: '0 4px 6px', lg: '0 10px 15px' },
} as const;
```

#### 8.3.3 CSS Variables con Soporte Dark Mode

```css
/* styles.scss - Variables CSS con tema */
@theme {
  /* Colores claros */
  --color-primary: #7B2CBF;
  --color-primary-light: #9D4EDD;
  --color-primary-dark: #5A189A;
  --color-secondary: #2D6A4F;
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F8FAFC;
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  
  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
}

/* Dark mode */
.dark {
  --color-bg-primary: #0F172A;
  --color-bg-secondary: #1E293B;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
}
```

#### 8.3.4 Aplicación de Colores por Componente

| Componente | Color Principal | Uso |
|------------|-----------------|-----|
| Botones primarios | #7B2CBF (Púrpura) | Acciones principales |
| Botones secundarios | #2D6A4F (Verde) | Acciones alternativas |
| Links y acciones | #00B4D8 (Cyan) | Navegación |
| Estados de éxito | #10B981 (Verde) | Confirmaciones |
| Estados de advertencia | #F59E0B (Amarillo) | Alertas |
| Estados de error | #EF4444 (Rojo) | Errores |
| Fondos alternados | #F8FAFC | Separación visual |

### 8.5 Jerarquía de Diseño

```
┌─────────────────────────────────────────────────────────┐
│                    PÁGINA COMPLETA                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Navbar (Logo + Navigation + User Menu)           │ │
│  │  - Logo: PrintX (Purple)                         │ │
│  │  - Links: Inicio, Servicios, Mi Cuenta            │ │
│  │  - User: Avatar + Dropdown                        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Container Principal                               │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Sidebar (Opcional para dashboard)           │  │ │
│  │  │  - Navegación contextual                    │  │ │
│  │  │  - Acciones rápidas                          │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Content Area                                 │  │ │
│  │  │  ┌────────────────────────────────────────┐  │ │ │
│  │  │  │ Page Header                              │  │ │ │
│  │  │  │  - Título + Breadcrumb                   │  │ │ │
│  │  │  │  - Acciones de página                   │  │ │ │
│  │  │  └────────────────────────────────────────┘  │ │ │
│  │  │                                             │  │ │
│  │  │  [Componentes de la página]                │  │ │
│  │  │                                             │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Footer                                            │ │
│  │  - Copyright, enlaces legales, contacto          │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 9. API Endpoints Resumen

### Prefijo de API: `/api/v1`

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| **Autenticación** | | | |
| POST | /auth/register | Registrar nuevo usuario | Público |
| POST | /auth/login | Iniciar sesión | Público |
| POST | /auth/refresh | Renovar token | Autenticado |
| POST | /auth/logout | Cerrar sesión | Autenticado |
| POST | /auth/forgot-password | Solicitar recuperación | Público |
| POST | /auth/reset-password | Restablecer contraseña | Público |
| GET | /auth/me | Obtener usuario actual | Autenticado |
| **Ofertas** | | | |
| GET | /offers | Listar ofertas disponibles | Público |
| GET | /offers/:id | Ver detalles de oferta | Público |
| GET | /offers/provider/:providerId | Ofertas de un proveedor | Público |
| POST | /offers | Crear nueva oferta | Proveedor |
| PUT | /offers/:id | Editar oferta | Proveedor |
| DELETE | /offers/:id | Eliminar oferta | Proveedor |
| **Pedidos** | | | |
| GET | /orders | Listar mis pedidos | Autenticado |
| GET | /orders/:id | Ver detalles del pedido | Autenticado |
| POST | /orders | Crear nuevo pedido | Cliente |
| PUT | /orders/:id/status | Actualizar estado | Proveedor |
| DELETE | /orders/:id | Cancelar pedido | Cliente |
| POST | /orders/:id/documents | Subir documento | Cliente |
| GET | /orders/:id/documents | Listar documentos | Autenticado |
| POST | /orders/:id/schedule | Agendar cita | Cliente |
| **Chat** | | | |
| GET | /chat/order/:orderId | Obtener mensajes | Autenticado |
| POST | /chat/order/:orderId | Enviar mensaje | Autenticado |
| PUT | /chat/:messageId/read | Marcar como leído | Autenticado |
| **Facturas** | | | |
| GET | /invoices/:id | Ver factura | Autenticado |
| GET | /invoices/order/:orderId | Factura del pedido | Autenticado |
| GET | /invoices/:id/pdf | Descargar PDF | Autenticado |
| POST | /invoices/:id/send | Enviar factura | Proveedor |
| **Pagos** | | | |
| GET | /payments/balance | Consultar saldo | Cliente |
| POST | /payments/deposit | Registrar depósito | Cliente |
| GET | /payments/transactions | Historial de transacciones | Cliente |
| GET | /payments/pending | Pagos pendientes | Proveedor |
| PUT | /payments/:id/verify | Verificar pago | Proveedor |
| **Estadísticas** | | | |
| GET | /stats/overview | Dashboard del proveedor | Proveedor |
| **Notificaciones** | | | |
| GET | /notifications | Mis notificaciones | Autenticado |
| PUT | /notifications/:id/read | Marcar como leído | Autenticado |
| PUT | /notifications/read-all | Marcar todas leídas | Autenticado |

---

## 10. Configuración Docker Compose

### 10.1 Archivo docker-compose.yml

```yaml
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: printx_postgres
    environment:
      POSTGRES_USER: printx
      POSTGRES_PASSWORD: printx_secret
      POSTGRES_DB: printx
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U printx"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - printx_network

  # Redis para caché y colas
  redis:
    image: redis:7-alpine
    container_name: printx_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - printx_network

  # Backend NestJS
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: printx_backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: printx
      DATABASE_PASSWORD: printx_secret
      DATABASE_NAME: printx
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET:-printx_jwt_secret_key_2024}
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
      - upload_files:/app/uploads
    command: npm run start:dev
    networks:
      - printx_network

  # Frontend Angular (servido con Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: printx_frontend
    ports:
      - "80:80"
    environment:
      API_URL: http://localhost:3000/api/v1
    depends_on:
      - backend
    volumes:
      - ./frontend/dist/browser:/usr/share/nginx/html
    networks:
      - printx_network

  # Adminer (gestión visual de PostgreSQL)
  adminer:
    image: adminer:latest
    container_name: printx_adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - printx_network

networks:
  printx_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  upload_files:
```

### 10.2 Puertos en Uso

| Servicio | Puerto | URL de Acceso |
|----------|--------|---------------|
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Backend | 3000 | localhost:3000 |
| Frontend | 80 | localhost |
| Adminer | 8080 | localhost:8080 |

### 10.3 Instrucciones de Uso

Para iniciar todos los servicios:

```bash
# Iniciar todos los contenedores
docker-compose up -d

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener todos los servicios
docker-compose down

# Reconstruir servicios (sin caché)
docker-compose build --no-cache
```

---

## 11. Flujo de Desarrollo Sugerido

### Fase 1: Fundación (Semana 1-2)

- [ ] Configurar proyecto NestJS con TypeScript
- [ ] Configurar proyecto Angular con Tailwind CSS y Signals
- [ ] Configurar Docker Compose con PostgreSQL y Redis
- [ ] Implementar módulo de autenticación (registro, login, JWT)
- [ ] Crear estructura base de usuarios y roles
- [ ] Configurar documentación de API con Swagger

### Fase 2: Funcionalidades Core (Semana 3-4)

- [ ] CRUD completo de Ofertas
- [ ] Sistema de pedidos completo
- [ ] Subida y gestión de documentos
- [ ] Chat en tiempo real con WebSocket
- [ ] Notificaciones básicas

### Fase 3: Pagos y Facturación (Semana 5)

- [ ] Sistema de saldo prepago
- [ ] Registro de depósitos
- [ ] Verificación de pagos
- [ ] Generación de facturas PDF
- [ ] Envío de facturas por múltiples canales

### Fase 4: Dashboard y Métricas (Semana 6)

- [ ] Dashboard con métricas para proveedor
- [ ] Gráficos y visualizaciones
- [ ] Estadísticas históricas
- [ ] Reportes descargables

### Fase 5: Pulido (Semana 7)

- [ ] Sistema completo de notificaciones
- [ ] Mejorar UI/UX
- [ ] Pruebas unitarias y de integración
- [ ] Limpieza de código y documentación
- [ ] Optimización de rendimiento

---

## 12. Consideraciones Importantes

### 12.1 Privacidad y Almacenamiento

El sistema implementa un modelo de almacenamiento similar a WhatsApp para optimizar recursos y mantener privacidad:

- Los documentos NO se almacenan permanentemente en el servidor
- Al descargar un archivo, este se elimina automáticamente del servidor
- Both Cliente y Proveedor almacenan copia en sus dispositivos locales
- El sistema no es responsable de la pérdida de archivos locales
- Esta arquitectura se comercializa como una ventaja de privacidad

### 12.2 Pagos en Cuba

Dado el contexto local, la integración real con TransferMovil o EnZona no está disponible:

- El sistema registra referencias de transferencia proporcionadas por el cliente
- La verificación se realiza manualmente por el proveedor o administrador
- El sistema de prepago ofrece una alternativa viable y controlada
- Se recomienda implementar recordatorios de pago

### 12.3 Archivos Pesados

Para manejar archivos grandes de manera eficiente:

- Tamaño máximo por archivo: 50MB
- Formatos soportados: PDF, DOCX, DOC, JPG, JPEG, PNG, WEBP
- Implementar streaming de archivos para uploads grandes
- Considerar compresión de imágenes antes de almacenar

### 12.4 WebSocket

Para comunicación en tiempo real:

- Utilizar Socket.io o WebSocket nativo
- Implementar reconnect automático
- Heartbeat periódico para mantener conexión viva
- Manejar desconexiones gracefully
- Persistir mensajes no entregados

---

## 13. Referencias y Recursos

- [Angular Signals - Documentación Oficial](https://angular.io/guide/signals)
- [NestJS - Documentación](https://docs.nestjs.com)
- [NestJS + BullMQ - Guía Completa](https://blog.nashtechglobal.com/mastering-bullmq-in-nestjs-a-step-by-step-introduction-part-1)
- [Tailwind CSS - Documentación](https://tailwindcss.com/docs)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [TypeORM - Documentación](https://typeorm.io)

---

**Documento creado:** Abril 2026  
**Versión:** 1.0  
**Proyecto:** PrintX - Sistema de Gestión de Servicios de Impresión

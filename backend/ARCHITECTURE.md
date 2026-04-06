# Backend Architecture - PrintX

## Estructura de Carpetas

```
src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── offers/
│   ├── orders/
│   ├── chat/
│   ├── payments/
│   ├── invoices/
│   ├── stats/
│   └── notifications/
├── events/
│   ├── handlers/
│   └── events.module.ts
├── jobs/
│   ├── jobs.module.ts
│   └── ...
├── config/
├── app.module.ts
└── main.ts
```

## Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| NestJS 11+ | Framework principal |
| Drizzle ORM | ORM moderno y ligero |
| PostgreSQL 15+ | Base de datos |
| Redis 7+ | Cache y colas (BullMQ) |
| @nestjs/event-emitter | Sistema de eventos |
| JWT + Passport | Autenticación |
| Class Validator | Validación de DTOs |
| Swagger/OpenAPI | Documentación |

## Módulos

### AuthModule
- Registro y login
- JWT con refresh tokens
- Estrategias de autenticación

### UsersModule
- CRUD de usuarios
- Perfiles (ProviderProfile)
- Roles (CLIENT, PROVIDER, ADMIN)

### OffersModule
- CRUD de ofertas
- Tipos: DOCUMENT, IMAGE, SCAN, COPY, BINDING

### OrdersModule
- Gestión de pedidos
- Estados: PENDING → CONFIRMED → IN_PROGRESS → READY → COMPLETED
- Documentos adjuntos

### ChatModule
- Mensajería por pedido
- WebSocket (Socket.io)

### PaymentsModule
- Sistema de prepago
- Depósitos y transacciones
- Verificación manual

### InvoicesModule
- Generación de facturas
- PDF

### StatsModule
- Métricas y estadísticas
- Agregación de datos

### NotificationsModule
- Notificaciones in-app
- Eventos del sistema

## Eventos del Dominio

```typescript
// events/domain-events.ts
export enum DomainEvent {
  ORDER_CREATED = 'order.created',
  ORDER_STATUS_CHANGED = 'order.status.changed',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_VERIFIED = 'payment.verified',
  INVOICE_ISSUED = 'invoice.issued',
  CHAT_MESSAGE_SENT = 'chat.message.sent',
}
```

```typescript
// orders/orders.service.ts
@Injectable()
export class OrdersService {
  constructor(private eventEmitter: EventEmitter2) {}
  
  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.repo.update(id, { status });
    this.eventEmitter.emit(DomainEvent.ORDER_STATUS_CHANGED, { order, status });
  }
}
```

## BullMQ Jobs

| Job | Descripción |
|-----|-------------|
| SendNotificationJob | Envía notificaciones |
| CleanupFilesJob | Limpia archivos temporales |
| StatsAggregationJob | Agrega estadísticas diarias |

## Docker Compose

```yaml
services:
  postgres:
    image: postgres:15-alpine
    # ...
  
  redis:
    image: redis:7-alpine
    # ...
  
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    # ...
```

---

**Relacionado**
- [Arquitectura General](../../doc/architecture/README.md)
- [API Overview](../../doc/api/README.md)
- [Guía de Inicio](../../doc/guides/getting-started.md)

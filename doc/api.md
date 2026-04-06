# API Documentation - PrintX

## Base URL

```
http://localhost:3000/api/v1
```

## Autenticación

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/register | Registrar usuario |
| POST | /auth/login | Iniciar sesión |
| POST | /auth/refresh | Renovar token |
| POST | /auth/logout | Cerrar sesión |
| POST | /auth/forgot-password | Solicitar recuperación |
| POST | /auth/reset-password | Restablecer contraseña |
| GET | /auth/me | Usuario actual |

### Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  }
}
```

## Ofertas

### Endpoints

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | /offers | Listar ofertas | Público |
| GET | /offers/:id | Ver oferta | Público |
| GET | /offers/provider/:providerId | Ofertas de proveedor | Público |
| POST | /offers | Crear oferta | Proveedor |
| PUT | /offers/:id | Editar oferta | Proveedor |
| DELETE | /offers/:id | Eliminar oferta | Proveedor |

### Modelo

```typescript
interface IOffer {
  id: string;
  providerId: string;
  title: string;
  description: string;
  type: 'DOCUMENT' | 'IMAGE' | 'SCAN' | 'COPY' | 'BINDING';
  basePrice: number;
  pricePerPage?: number;
  pricePerUnit?: number;
  isActive: boolean;
  createdAt: Date;
}
```

## Pedidos

### Endpoints

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | /orders | Mis pedidos | Auth |
| GET | /orders/:id | Ver pedido | Auth |
| POST | /orders | Crear pedido | Cliente |
| PUT | /orders/:id/status | Actualizar estado | Proveedor |
| DELETE | /orders/:id | Cancelar pedido | Cliente |
| POST | /orders/:id/documents | Subir documento | Cliente |
| POST | /orders/:id/schedule | Agendar cita | Cliente |

### Estados

```
PENDING → CONFIRMED → IN_PROGRESS → READY → COMPLETED
                ↓                     
           CANCELLED
```

## Chat

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /chat/order/:orderId | Mensajes del pedido |
| POST | /chat/order/:orderId | Enviar mensaje |
| PUT | /chat/:messageId/read | Marcar como leído |

### WebSocket Events

```
chat:message    → Nuevo mensaje
chat:typing     → Escribiendo
chat:read       → Mensaje leído
```

## Facturas

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /invoices/:id | Ver factura |
| GET | /invoices/order/:orderId | Factura del pedido |
| GET | /invoices/:id/pdf | Descargar PDF |
| POST | /invoices/:id/send | Enviar factura |

## Pagos

### Endpoints

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | /payments/balance | Saldo prepago | Cliente |
| POST | /payments/deposit | Registrar depósito | Cliente |
| GET | /payments/transactions | Historial | Cliente |
| GET | /payments/pending | Pagos pendientes | Proveedor |
| PUT | /payments/:id/verify | Verificar pago | Proveedor |

## Estadísticas

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /stats/overview | Dashboard |
| GET | /stats/revenue | Ingresos |
| GET | /stats/orders-by-status | Por estado |
| GET | /stats/orders-by-type | Por tipo |
| GET | /stats/top-clients | Mejores clientes |
| GET | /stats/trend | Tendencia |

## Notificaciones

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /notifications | Mis notificaciones |
| PUT | /notifications/:id/read | Marcar leída |
| PUT | /notifications/read-all | Marcar todas leídas |

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

**Swagger**: Disponible en `/api/docs`

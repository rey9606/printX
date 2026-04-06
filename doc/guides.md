# Getting Started - PrintX

## Prerequisitos

- Node.js 20+
- pnpm 8+
- Docker y Docker Compose
- Git

## Configuración del Entorno

### 1. Clonar el repositorio

```bash
git clone https://github.com/rey9606/printX.git
cd printX
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# Frontend
cp frontend/src/environments/environment.ts.example frontend/src/environments/environment.ts
```

### 3. Iniciar servicios con Docker

```bash
docker-compose up -d
```

Esto inicia:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- Nginx (puerto 80)

### 4. Instalar dependencias

```bash
# Backend
cd backend
pnpm install

# Frontend
cd frontend
pnpm install
```

### 5. Iniciar desarrollo

```bash
# Backend
cd backend
pnpm run start:dev

# Frontend (en otra terminal)
cd frontend
pnpm run start
```

## Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend | 3000 | http://localhost:3000 |
| Frontend | 4200 | http://localhost:4200 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Nginx | 80 | http://localhost |
| Adminer | 8080 | http://localhost:8080 |

## Estructura del Proyecto

```
printX/
├── backend/          # NestJS + ARCHITECTURE.md
├── frontend/         # Angular 21+ + ARCHITECTURE.md
├── doc/              # Documentación
│   ├── architecture.md
│   ├── api.md
│   ├── guides.md
│   └── PHASES.md
├── docker-compose.yml
└── README.md
```

## Comandos Útiles

```bash
# Rebuild Docker
docker-compose build --no-cache

# Ver logs
docker-compose logs -f backend

# Reset database
docker-compose down -v
docker-compose up -d
```

## Siguiente Paso

Ver [Arquitectura](architecture.md) para entender la estructura del proyecto.

---

**Issues**: https://github.com/rey9606/printX/issues

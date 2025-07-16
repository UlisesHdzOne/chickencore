# 🍗 ChickenCore - Sistema de Ventas Avanzado

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

## 📋 Descripción

**ChickenCore** es un sistema completo de ventas especializado en pollos asados con funcionalidades avanzadas de:

- 🛒 **Carrito inteligente** con selección de regalos
- 📅 **Pedidos agendados** con reglas de negocio configurables
- 📦 **Gestión de inventario** en tiempo real
- 👥 **Múltiples roles** (Admin, Cajero, Usuario)
- 📊 **Reportes y analytics** detallados
- 🔔 **Notificaciones automáticas**
- 📱 **Diseño responsive** para web y móvil

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- Docker y Docker Compose (opcional)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd chickencore

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Desarrollo

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run start:prod

# Con Docker
docker-compose up -d
```

## 🏗️ Arquitectura del Sistema

### Módulos Principales

- **🔐 Auth**: Autenticación JWT, roles y permisos
- **👤 User Profile**: Gestión de perfiles y direcciones
- **📦 Products**: Catálogo de productos con regalos
- **🛒 Cart**: Carrito inteligente con validaciones
- **📋 Orders**: Pedidos inmediatos y agendados
- **📅 Scheduling**: Reglas de agendamiento configurables

### Stack Tecnológico

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI
- **Validación**: Class Validator + Class Transformer
- **Logging**: Winston
- **Containerización**: Docker

## 📚 Documentación

- 📖 **[Análisis y Feedback](./FEEDBACK_Y_ANALISIS.md)** - Análisis completo del proyecto
- 🏗️ **[Arquitectura Frontend](./FRONTEND_ARCHITECTURE.md)** - Guía para implementar el frontend
- 🚀 **[Guía de Despliegue](./DEPLOYMENT_GUIDE.md)** - Instrucciones de despliegue completas

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Servidor en modo desarrollo
npm run start:debug        # Servidor con debug

# Base de datos
npm run db:generate         # Generar cliente Prisma
npm run db:migrate          # Ejecutar migraciones
npm run db:seed            # Poblar con datos iniciales
npm run db:reset           # Resetear y poblar BD

# Producción
npm run build              # Construir aplicación
npm run start:prod         # Servidor en producción

# Testing
npm run test               # Tests unitarios
npm run test:e2e           # Tests end-to-end
npm run test:cov           # Coverage de tests
```

## 🌟 Características Principales

### Sistema de Productos con Regalos
- Productos con regalos configurables
- Selección inteligente de regalos por el usuario
- Validaciones automáticas de cantidades permitidas

### Carrito Inteligente
- Persistencia de carrito por usuario
- Cálculo automático de totales con impuestos
- Validación de stock en tiempo real
- Selección de regalos por producto

### Pedidos Agendados
- Reglas de agendamiento configurables por día
- Validación de montos mínimos y cantidades
- Horarios de entrega personalizables
- Notificaciones automáticas

### Gestión de Inventario
- Control de stock en tiempo real
- Movimientos de inventario rastreables
- Alertas de stock bajo
- Ajustes manuales de inventario

## 🔑 Usuarios de Prueba

Después de ejecutar `npm run db:seed`:

```
👤 Admin: admin@chickencore.com / password123
👤 Cajero: cajero@chickencore.com / password123
👤 Usuario: usuario@test.com / password123
```

## 📊 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/profile` - Obtener perfil

### Productos
- `GET /products` - Listar productos
- `GET /products/:id` - Obtener producto
- `GET /products/gifts` - Productos disponibles como regalos
- `GET /categories` - Listar categorías

### Carrito
- `GET /cart` - Obtener carrito
- `POST /cart/add` - Agregar al carrito
- `PATCH /cart/items/:id` - Actualizar cantidad
- `DELETE /cart/items/:id` - Eliminar del carrito

### Pedidos
- `POST /orders` - Crear pedido
- `GET /orders` - Listar pedidos
- `GET /orders/my-orders` - Mis pedidos
- `PATCH /orders/:id/status` - Actualizar estado

### Agendamiento
- `GET /scheduling/info/weekly` - Información semanal
- `POST /scheduling/validate` - Validar agendamiento
- `GET /scheduling/time-slots` - Horarios disponibles

## 🚀 Despliegue

### Desarrollo Local
```bash
# Con Docker
docker-compose up -d

# Sin Docker
npm run start:dev
```

### Producción
Ver [Guía de Despliegue](./DEPLOYMENT_GUIDE.md) para instrucciones completas.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para preguntas y soporte, puedes:
- Crear un issue en GitHub
- Consultar la documentación en los archivos MD del proyecto
- Revisar los ejemplos en el código

---

**¡Construido con ❤️ para revolucionar las ventas de pollo asado!** 🍗

# 🚀 Guía de Despliegue - ChickenCore

## 📋 **Requisitos del Sistema**

### **Backend**
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (opcional, recomendado)
- Docker y Docker Compose

### **Frontend**
- Node.js 18+
- Android Studio (para apps Android)
- Xcode (para apps iOS)

---

## 🛠️ **Configuración del Backend**

### **1. Variables de Entorno**

Crear archivo `.env` en la raíz del proyecto:

```bash
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/chickencore"

# JWT
JWT_SECRET="tu_jwt_secret_muy_seguro_aqui"
JWT_EXPIRES_IN="7d"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu_email@gmail.com"
SMTP_PASS="tu_password_app"

# Redis (opcional)
REDIS_URL="redis://localhost:6379"

# App
NODE_ENV="production"
PORT=3000
```

### **2. Configuración de Base de Datos**

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar base de datos con datos iniciales
npm run db:seed
```

### **3. Construcción y Despliegue**

```bash
# Construir aplicación
npm run build

# Iniciar en producción
npm run start:prod
```

---

## 🐳 **Despliegue con Docker**

### **1. Dockerfile del Backend**

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### **2. Docker Compose Completo**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: chickencore
      POSTGRES_USER: chickencore
      POSTGRES_PASSWORD: chickencore123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis (opcional)
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  # Backend API
  backend:
    build: .
    environment:
      DATABASE_URL: postgresql://chickencore:chickencore123@postgres:5432/chickencore
      JWT_SECRET: tu_jwt_secret_muy_seguro_aqui
      JWT_EXPIRES_IN: 7d
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # Nginx (proxy reverso)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### **3. Configuración de Nginx**

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name tu-dominio.com;

        # Redirigir HTTP a HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name tu-dominio.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Configuración SSL
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # API Backend
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend estático
        location / {
            root /var/www/html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

---

## 🌐 **Despliegue en la Nube**

### **1. Heroku**

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear aplicación
heroku create chickencore-api

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
heroku config:set DATABASE_URL=postgresql://...

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Desplegar
git push heroku main

# Ejecutar migraciones
heroku run npm run db:migrate
heroku run npm run db:seed
```

### **2. Railway**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway new chickencore

# Configurar variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Agregar PostgreSQL
railway add postgresql

# Desplegar
railway up
```

### **3. DigitalOcean App Platform**

```yaml
# .do/app.yaml
name: chickencore
services:
- name: api
  source_dir: /
  github:
    repo: tu-usuario/chickencore
    branch: main
  run_command: npm run start:prod
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: tu_jwt_secret_muy_seguro_aqui
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}

databases:
- name: db
  engine: PG
  version: "14"
  size: basic-xs
```

---

## 📱 **Despliegue del Frontend**

### **1. Construcción para Producción**

```bash
# Instalar dependencias
npm install

# Construir para web
npm run build

# Construir para móvil
npm run build:mobile
```

### **2. Despliegue Web**

#### **Vercel**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel --prod
```

#### **Netlify**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Construir y desplegar
npm run build
netlify deploy --prod --dir=build
```

### **3. Despliegue Móvil**

#### **Android (Google Play Store)**
```bash
# Construir APK
npm run build:mobile
npx cap open android

# En Android Studio:
# 1. Build > Generate Signed Bundle/APK
# 2. Seleccionar Android App Bundle
# 3. Crear/usar keystore
# 4. Subir a Google Play Console
```

#### **iOS (App Store)**
```bash
# Construir para iOS
npm run build:mobile
npx cap open ios

# En Xcode:
# 1. Product > Archive
# 2. Window > Organizer
# 3. Distribute App
# 4. Subir a App Store Connect
```

---

## 🔧 **Configuración de Producción**

### **1. Optimizaciones del Backend**

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Documentación Swagger (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ChickenCore API')
      .setDescription('API para sistema de ventas de pollo')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API corriendo en puerto ${port}`);
}

bootstrap();
```

### **2. Configuración de PM2**

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'chickencore-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start ecosystem.config.js

# Configurar inicio automático
pm2 startup
pm2 save
```

---

## 🔍 **Monitoreo y Logs**

### **1. Configuración de Logging**

```typescript
// src/common/logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});
```

### **2. Health Checks**

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Verificar conexión a base de datos
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
```

---

## 📊 **Métricas y Monitoreo**

### **1. Configurar Prometheus**

```typescript
// src/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
export class MetricsModule {}
```

### **2. Docker Compose con Monitoring**

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

---

## 🔐 **Seguridad en Producción**

### **1. Configuración SSL**

```bash
# Obtener certificado SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

### **2. Configuración de Firewall**

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 3000   # Bloquear acceso directo al backend
```

### **3. Backup de Base de Datos**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="chickencore"

# Crear backup
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "backup_*.sql" -type f -mtime +7 -delete

# Subir a S3 (opcional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql s3://tu-bucket/backups/
```

```bash
# Configurar cron para backups automáticos
crontab -e
# Agregar línea para backup diario a las 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🚀 **Comandos de Despliegue Rápido**

### **Desarrollo Local**
```bash
# Backend
npm run start:dev

# Frontend
npm start
```

### **Producción con Docker**
```bash
# Construir y ejecutar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### **Actualización en Producción**
```bash
# 1. Backup de base de datos
pg_dump chickencore > backup_$(date +%Y%m%d).sql

# 2. Actualizar código
git pull origin main

# 3. Instalar dependencias
npm install

# 4. Ejecutar migraciones
npm run db:migrate

# 5. Construir aplicación
npm run build

# 6. Reiniciar con PM2
pm2 restart chickencore-api
```

---

## 🎯 **Checklist de Despliegue**

### **Pre-despliegue**
- [ ] Variables de entorno configuradas
- [ ] Base de datos creada y migrada
- [ ] Certificados SSL configurados
- [ ] Firewall configurado
- [ ] Backups automatizados

### **Post-despliegue**
- [ ] Health checks funcionando
- [ ] Logs configurados
- [ ] Métricas disponibles
- [ ] Monitoreo activo
- [ ] Documentación actualizada

¡Tu sistema ChickenCore está listo para producción! 🎉
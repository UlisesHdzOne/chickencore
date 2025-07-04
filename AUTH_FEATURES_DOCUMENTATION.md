# 🔐 Nuevas Funcionalidades de Autenticación - ChickenCore

## 📋 Resumen de Implementación

Se han implementado **4 módulos principales** de funcionalidades avanzadas de autenticación:

1. **Verificación de Email** ✉️
2. **Gestión de Sesiones** 📱
3. **Autenticación de Dos Factores (2FA)** 🛡️
4. **Validaciones de Seguridad** 🔍

---

## ✉️ **1. Verificación de Email**

### Endpoints Implementados:
```http
POST /auth/send-verification-email
POST /auth/verify-email
POST /auth/resend-verification
```

### Flujo de Verificación:
1. **Envío**: El usuario solicita verificación de email
2. **Token**: Se genera un token único con expiración de 24h
3. **Email**: Se envía email con enlace de verificación
4. **Verificación**: Usuario hace clic en el enlace o usa el token
5. **Confirmación**: Email marcado como verificado

### Ejemplo de Uso:
```javascript
// Enviar email de verificación
const response = await fetch('/auth/send-verification-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// Verificar email
const verifyResponse = await fetch('/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'abc123def456' })
});
```

---

## 📱 **2. Gestión de Sesiones**

### Endpoints Implementados:
```http
GET /auth/active-sessions          # Ver sesiones activas
DELETE /auth/session/:sessionId    # Cerrar sesión específica
POST /auth/logout-all-devices      # Cerrar todas las sesiones
```

### Características:
- **Múltiples Sesiones**: Permite login desde varios dispositivos
- **Tracking**: Rastrea IP, dispositivo, user agent
- **Control Granular**: Cierre individual o masivo de sesiones
- **Seguridad**: Invalidación automática de tokens

### Ejemplo de Uso:
```javascript
// Ver sesiones activas
const sessions = await fetch('/auth/active-sessions', {
  headers: { 'Authorization': 'Bearer ' + accessToken }
});

// Cerrar sesión específica
await fetch('/auth/session/session-id-123', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ' + accessToken }
});

// Cerrar todas las sesiones
await fetch('/auth/logout-all-devices', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + accessToken }
});
```

---

## 🛡️ **3. Autenticación de Dos Factores (2FA)**

### Endpoints Implementados:
```http
GET /auth/2fa/qr-code        # Generar código QR para configurar
POST /auth/enable-2fa        # Habilitar 2FA
POST /auth/verify-2fa        # Verificar código 2FA
POST /auth/disable-2fa       # Deshabilitar 2FA
```

### Flujo de Configuración:
1. **QR Code**: Usuario solicita código QR
2. **App Authenticator**: Usuario escanea QR con Google Authenticator, Authy, etc.
3. **Verificación**: Usuario ingresa código de 6 dígitos
4. **Activación**: 2FA se habilita y se generan códigos de respaldo
5. **Login**: A partir de ahora, login requiere código 2FA

### Características:
- **TOTP Estándar**: Compatible con Google Authenticator, Authy, etc.
- **Códigos de Respaldo**: 10 códigos únicos para emergencias
- **Window**: Acepta códigos con 2 ventanas de tiempo (tolerancia)
- **Seguridad**: Secret encriptado en base de datos

### Ejemplo de Uso:
```javascript
// Generar QR para configurar 2FA
const qrResponse = await fetch('/auth/2fa/qr-code', {
  headers: { 'Authorization': 'Bearer ' + accessToken }
});
const { qrCodeUrl, secret } = await qrResponse.json();

// Habilitar 2FA
const enableResponse = await fetch('/auth/enable-2fa', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ verificationCode: '123456' })
});
```

---

## 🔍 **4. Validaciones de Seguridad**

### Endpoints Implementados:
```http
POST /auth/check-password-strength    # Analizar fortaleza de contraseña
POST /auth/validate-token            # Validar token JWT
GET /auth/security-logs              # Historial de eventos de seguridad
```

### Funcionalidades:

#### **Análisis de Contraseña**:
- Longitud mínima (8 caracteres)
- Mayúsculas y minúsculas
- Números y símbolos
- Detección de patrones comunes
- Score de 1-5 con recomendaciones

#### **Validación de Token**:
- Verificación de firma JWT
- Comprobación de expiración
- Validación de usuario activo
- Decodificación segura

#### **Logs de Seguridad**:
- Eventos de login (exitosos/fallidos)
- Cambios de configuración de seguridad
- Activación/desactivación de 2FA
- Cierres de sesión
- Paginación de resultados

### Ejemplo de Uso:
```javascript
// Verificar fortaleza de contraseña
const strengthResponse = await fetch('/auth/check-password-strength', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'MyPassword123!' })
});

// Resultado:
{
  "score": 4,
  "strength": "good",
  "suggestions": ["Incluye al menos un símbolo especial"],
  "meets": {
    "length": true,
    "uppercase": true,
    "lowercase": true,
    "numbers": true,
    "symbols": false
  }
}

// Ver logs de seguridad
const logs = await fetch('/auth/security-logs?page=1&limit=10', {
  headers: { 'Authorization': 'Bearer ' + accessToken }
});
```

---

## 🗄️ **Cambios en Base de Datos**

### Nuevos Campos en `User`:
```sql
emailVerified         BOOLEAN   DEFAULT false
emailVerifiedAt       TIMESTAMP
twoFactorEnabled      BOOLEAN   DEFAULT false
twoFactorSecret       TEXT
lastLoginAt           TIMESTAMP
isActive              BOOLEAN   DEFAULT true
```

### Nuevas Tablas:
```sql
-- Tokens de verificación de email
EmailVerificationToken {
  id, userId, token, expiresAt, createdAt
}

-- Gestión de sesiones
UserSession {
  id, userId, deviceInfo, ipAddress, userAgent, 
  isActive, createdAt, lastUsedAt, expiresAt
}

-- Logs de eventos de seguridad
SecurityLog {
  id, userId, eventType, details, ipAddress, 
  userAgent, success, createdAt
}
```

### Modificaciones en `RefreshToken`:
- Soporte para múltiples tokens por usuario
- Asociación con sesiones específicas
- Tracking de dispositivo e IP

---

## ⚙️ **Configuración Requerida**

### Variables de Entorno:
```bash
# Base de datos
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"

# Email
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
MAIL_FROM="ChickenCore <noreply@chickencore.com>"

# Frontend (para enlaces de verificación)
FRONTEND_URL="http://localhost:3000"
```

### Dependencias Instaladas:
```json
{
  "speakeasy": "^2.0.0",      // 2FA TOTP
  "qrcode": "^1.5.3",         // Generación de QR
  "@types/speakeasy": "^2.0.10",
  "@types/qrcode": "^1.5.5"
}
```

---

## 🚀 **Comandos para Implementar**

### 1. Configurar Base de Datos:
```bash
# Crear archivo .env con las variables necesarias
cp .env.example .env

# Editar .env con tus configuraciones
# Ejecutar migración
npx prisma migrate dev --name "add-advanced-auth-features"
```

### 2. Ejecutar Aplicación:
```bash
npm run start:dev
```

### 3. Probar Endpoints:
- Swagger UI: `http://localhost:3000/api`
- Documentación interactiva con todos los endpoints

---

## 🛡️ **Consideraciones de Seguridad**

### Implementadas:
✅ **Tokens con Expiración**: Todos los tokens tienen TTL
✅ **Rate Limiting**: Preparado para implementar
✅ **Validación de Input**: DTOs con class-validator
✅ **Logs de Auditoría**: Registro de eventos críticos
✅ **Sesiones Múltiples**: Control granular de acceso
✅ **2FA Estándar**: TOTP compatible con apps conocidas

### Recomendaciones Adicionales:
- Implementar rate limiting en endpoints críticos
- Usar HTTPS en producción
- Configurar CORS apropiadamente
- Backup de códigos 2FA encriptados
- Rotación periódica de secrets JWT

---

## 📊 **Eventos de Seguridad Registrados**

| Evento | Descripción |
|--------|-------------|
| `LOGIN_SUCCESS` | Login exitoso |
| `LOGIN_FAILED` | Intento de login fallido |
| `PASSWORD_CHANGE` | Cambio de contraseña |
| `EMAIL_VERIFICATION` | Email verificado |
| `TWO_FACTOR_ENABLED` | 2FA habilitado |
| `TWO_FACTOR_DISABLED` | 2FA deshabilitado |
| `SESSION_LOGOUT` | Cierre de sesión |
| `ACCOUNT_LOCKED` | Cuenta bloqueada |

---

## 🎯 **Próximos Pasos Sugeridos**

1. **Testing**: Implementar tests unitarios y E2E
2. **Rate Limiting**: Agregar throttling con `@nestjs/throttler`
3. **Email Templates**: Mejorar plantillas de email
4. **Mobile Support**: Endpoints específicos para apps móviles
5. **Admin Panel**: Dashboard para gestión de usuarios y seguridad

---

¡Tu módulo de autenticación ahora tiene funcionalidades de nivel empresarial! 🚀
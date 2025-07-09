# 🔄 Casos de Uso Adicionales para el Módulo User-Profile

## 📋 **Casos de Uso Básicos (Ya Mencionados)**
```
✅ get-user-profile.use-case.ts
✅ update-profile.use-case.ts  
✅ upload-profile-picture.use-case.ts
✅ manage-addresses.use-case.ts
```

## 🚀 **Casos de Uso Adicionales Recomendados**

### 🔐 **1. Seguridad y Gestión de Cuenta**

#### **change-email.use-case.ts**
- **Propósito**: Cambiar email con verificación de seguridad
- **Flujo**: 
  1. Validar contraseña actual
  2. Enviar código de verificación al nuevo email
  3. Confirmar cambio tras verificación
  4. Actualizar sesiones activas

```typescript
export class ChangeEmailUseCase {
  async execute(userId: number, newEmail: string, currentPassword: string) {
    // 1. Verificar contraseña actual
    // 2. Verificar que el nuevo email no esté en uso
    // 3. Crear token de verificación
    // 4. Enviar email de confirmación
    // 5. Log de seguridad
  }
}
```

#### **delete-account.use-case.ts**
- **Propósito**: Eliminación segura de cuenta con confirmación
- **Incluye**: Backup de datos, confirmación por email, período de gracia

#### **export-user-data.use-case.ts**
- **Propósito**: Exportar datos del usuario (GDPR compliance)
- **Formato**: JSON/PDF con toda la información del usuario

### 📱 **2. Verificación y Validación**

#### **verify-phone-number.use-case.ts**
- **Propósito**: Verificar número de teléfono mediante SMS
- **Beneficio**: Aumenta seguridad y permite recuperación de cuenta

```typescript
export class VerifyPhoneNumberUseCase {
  async execute(userId: number, phoneNumber: string) {
    // 1. Generar código OTP
    // 2. Enviar SMS
    // 3. Guardar código temporal
    // 4. Marcar como pendiente verificación
  }
  
  async confirmVerification(userId: number, code: string) {
    // 1. Validar código
    // 2. Marcar teléfono como verificado
    // 3. Log de seguridad
  }
}
```

#### **validate-address.use-case.ts**
- **Propósito**: Validar direcciones usando APIs de geocodificación
- **Beneficio**: Asegurar direcciones válidas para entregas futuras

### 🔍 **3. Análisis y Completitud del Perfil**

#### **check-profile-completeness.use-case.ts**
- **Propósito**: Calcular porcentaje de completitud del perfil
- **Beneficio**: Motivar usuarios a completar información

```typescript
export class CheckProfileCompletenessUseCase {
  async execute(userId: number) {
    const profile = await this.getProfile(userId);
    
    const requiredFields = [
      'firstName', 'lastName', 'phoneNumber', 
      'profilePicture', 'defaultAddress'
    ];
    
    const completedFields = requiredFields.filter(
      field => profile[field] && profile[field] !== ''
    );
    
    return {
      completeness: (completedFields.length / requiredFields.length) * 100,
      missingFields: requiredFields.filter(field => !profile[field]),
      suggestions: this.generateSuggestions(completedFields)
    };
  }
}
```

### 📸 **4. Gestión Avanzada de Archivos**

#### **optimize-profile-picture.use-case.ts**
- **Propósito**: Optimizar automáticamente imágenes (redimensionar, comprimir)
- **Beneficio**: Mejor rendimiento y menor uso de almacenamiento

#### **delete-profile-picture.use-case.ts**
- **Propósito**: Eliminar foto de perfil y limpiar archivos
- **Incluye**: Eliminar archivo físico y actualizar BD

### 🔔 **5. Preferencias y Configuración**

#### **update-notification-preferences.use-case.ts**
- **Propósito**: Gestionar preferencias de notificaciones
- **Tipos**: Email, SMS, push notifications

```typescript
export class UpdateNotificationPreferencesUseCase {
  async execute(userId: number, preferences: NotificationPreferences) {
    // Actualizar preferencias de:
    // - Email marketing
    // - Notificaciones de pedidos
    // - Alertas de seguridad
    // - Promociones
  }
}
```

#### **update-privacy-settings.use-case.ts**
- **Propósito**: Configurar opciones de privacidad
- **Incluye**: Visibilidad de perfil, uso de datos, cookies

### 📊 **6. Auditoría y Actividad**

#### **get-profile-activity-log.use-case.ts**
- **Propósito**: Mostrar historial de cambios en el perfil
- **Beneficio**: Transparencia y seguridad para el usuario

#### **track-profile-changes.use-case.ts**
- **Propósito**: Registrar automáticamente cambios importantes
- **Incluye**: Qué cambió, cuándo, desde qué IP

### 🌍 **7. Geolocalización y Direcciones Avanzadas**

#### **geocode-address.use-case.ts**
- **Propósito**: Convertir direcciones a coordenadas
- **Beneficio**: Preparación para funciones de entrega y mapas

#### **get-nearby-services.use-case.ts**
- **Propósito**: Encontrar servicios cerca de las direcciones del usuario
- **Futuro**: Tiendas cercanas, puntos de entrega

### 🔗 **8. Integración Social (Futuro)**

#### **connect-social-accounts.use-case.ts**
- **Propósito**: Conectar cuentas de redes sociales
- **Beneficio**: Login social, importar información

## 📅 **Priorización por Fases**

### **🚀 Fase 1 - MVP Esencial**
```
✅ get-user-profile.use-case.ts
✅ update-profile.use-case.ts
✅ upload-profile-picture.use-case.ts
✅ manage-addresses.use-case.ts
+ delete-profile-picture.use-case.ts
+ check-profile-completeness.use-case.ts
```

### **🔧 Fase 2 - Seguridad y Validación**
```
+ verify-phone-number.use-case.ts
+ change-email.use-case.ts
+ validate-address.use-case.ts
+ get-profile-activity-log.use-case.ts
```

### **⚡ Fase 3 - Funcionalidades Avanzadas**
```
+ optimize-profile-picture.use-case.ts
+ update-notification-preferences.use-case.ts
+ update-privacy-settings.use-case.ts
+ export-user-data.use-case.ts
```

### **🌟 Fase 4 - Características Premium**
```
+ geocode-address.use-case.ts
+ get-nearby-services.use-case.ts
+ connect-social-accounts.use-case.ts
+ delete-account.use-case.ts
```

## 🏗️ **Estructura de Carpetas Actualizada**

```
src/modules/user-profile/
├── dto/
│   ├── update-profile.dto.ts
│   ├── upload-profile-picture.dto.ts
│   ├── create-address.dto.ts
│   ├── update-address.dto.ts
│   ├── change-email.dto.ts
│   ├── verify-phone.dto.ts
│   └── notification-preferences.dto.ts
├── services/
│   ├── profile-picture.service.ts
│   ├── address.service.ts
│   ├── notification.service.ts
│   └── validation.service.ts
├── use-cases/
│   ├── basic/
│   │   ├── get-user-profile.use-case.ts
│   │   ├── update-profile.use-case.ts
│   │   └── manage-addresses.use-case.ts
│   ├── media/
│   │   ├── upload-profile-picture.use-case.ts
│   │   ├── delete-profile-picture.use-case.ts
│   │   └── optimize-profile-picture.use-case.ts
│   ├── security/
│   │   ├── change-email.use-case.ts
│   │   ├── verify-phone-number.use-case.ts
│   │   └── delete-account.use-case.ts
│   ├── validation/
│   │   ├── validate-address.use-case.ts
│   │   └── check-profile-completeness.use-case.ts
│   └── preferences/
│       ├── update-notification-preferences.use-case.ts
│       └── update-privacy-settings.use-case.ts
├── controllers/
│   ├── user-profile.controller.ts
│   ├── user-addresses.controller.ts
│   └── user-preferences.controller.ts
├── user-profile.service.ts
└── user-profile.module.ts
```

## 💡 **Casos de Uso Recomendados para Empezar**

Para tu caso específico, te recomiendo comenzar con estos casos de uso adicionales:

1. **delete-profile-picture.use-case.ts** - Complementa la subida de fotos
2. **check-profile-completeness.use-case.ts** - Mejora UX motivando completar perfil
3. **verify-phone-number.use-case.ts** - Esencial para seguridad
4. **validate-address.use-case.ts** - Importante para futuro módulo de pedidos

¿Cuáles de estos casos de uso te parecen más importantes para tu proyecto? ¿Te gustaría que implemente alguno específicamente?
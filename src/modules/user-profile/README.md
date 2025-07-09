# 📋 Módulo User Profile

## 🎯 **Descripción**
Módulo completo para la gestión de perfiles de usuario, incluyendo información personal, fotos de perfil y direcciones múltiples.

## 🏗️ **Arquitectura**

### **Casos de Uso Implementados**
- ✅ `GetUserProfileUseCase` - Obtener perfil completo con completitud
- ✅ `UpdateProfileUseCase` - Actualizar información básica
- ✅ `UploadProfilePictureUseCase` - Subir y gestionar fotos de perfil
- ✅ `ManageAddressesUseCase` - CRUD completo de direcciones

### **Estructura de Archivos**
```
src/modules/user-profile/
├── dto/
│   ├── update-profile.dto.ts           # Actualizar info básica
│   ├── create-address.dto.ts           # Crear nueva dirección
│   ├── update-address.dto.ts           # Actualizar dirección
│   ├── set-default-address.dto.ts      # Establecer dirección default
│   └── upload-profile-picture.dto.ts   # Subir foto de perfil
├── use-cases/basic/
│   ├── get-user-profile.use-case.ts    # Obtener perfil completo
│   ├── update-profile.use-case.ts      # Actualizar información
│   ├── upload-profile-picture.use-case.ts # Gestión de fotos
│   └── manage-addresses.use-case.ts    # CRUD de direcciones
├── controllers/
│   └── user-profile.controller.ts      # Endpoints REST
├── user-profile.service.ts             # Servicio principal
├── user-profile.module.ts              # Configuración del módulo
└── README.md                           # Esta documentación
```

## 🔗 **Endpoints Disponibles**

### **📱 Perfil de Usuario**

#### **GET /user-profile**
Obtiene el perfil completo del usuario autenticado.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phoneNumber": "+52 55 1234 5678",
  "profilePicture": "/uploads/profiles/1-1234567890.jpg",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "bio": "Desarrollador apasionado por la tecnología",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "addresses": [
    {
      "id": 1,
      "label": "Casa",
      "street": "Av. Insurgentes Sur 123",
      "city": "Ciudad de México",
      "state": "CDMX",
      "postalCode": "06700",
      "country": "Mexico",
      "isDefault": true
    }
  ],
  "defaultAddress": {
    "id": 1,
    "label": "Casa",
    "street": "Av. Insurgentes Sur 123",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postalCode": "06700",
    "country": "Mexico"
  },
  "profileCompleteness": {
    "percentage": 100,
    "missingFields": [],
    "hasDefaultAddress": true
  }
}
```

#### **PUT /user-profile**
Actualiza la información básica del perfil.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "phoneNumber": "+52 55 9876 5432",
  "dateOfBirth": "1990-01-15",
  "bio": "Desarrollador full-stack especializado en NestJS y React"
}
```

**Respuesta:**
```json
{
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": 1,
    "firstName": "Juan Carlos",
    "lastName": "Pérez García",
    "phoneNumber": "+52 55 9876 5432",
    "profilePicture": "/uploads/profiles/1-1234567890.jpg",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "bio": "Desarrollador full-stack especializado en NestJS y React",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  }
}
```

#### **POST /user-profile/picture**
Sube una nueva foto de perfil.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
file: [imagen.jpg] (archivo de imagen JPG, PNG o WebP, máximo 5MB)
```

**Respuesta:**
```json
{
  "message": "Foto de perfil actualizada exitosamente",
  "profilePicture": "/uploads/profiles/1-1642234567890.jpg",
  "user": {
    "id": 1,
    "firstName": "Juan Carlos",
    "lastName": "Pérez García",
    "profilePicture": "/uploads/profiles/1-1642234567890.jpg",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### **🏠 Direcciones**

#### **GET /user-profile/addresses**
Obtiene todas las direcciones del usuario.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "label": "Casa",
    "street": "Av. Insurgentes Sur 123, Col. Roma Norte",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postalCode": "06700",
    "country": "Mexico",
    "isDefault": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "userId": 1,
    "label": "Trabajo",
    "street": "Paseo de la Reforma 456, Col. Juárez",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postalCode": "06600",
    "country": "Mexico",
    "isDefault": false,
    "createdAt": "2024-01-10T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z"
  }
]
```

#### **POST /user-profile/addresses**
Crea una nueva dirección.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
  "label": "Oficina",
  "street": "Av. Santa Fe 1234, Col. Santa Fe",
  "city": "Ciudad de México",
  "state": "CDMX",
  "postalCode": "01210",
  "country": "Mexico",
  "isDefault": false
}
```

**Respuesta:**
```json
{
  "message": "Dirección creada exitosamente",
  "address": {
    "id": 3,
    "userId": 1,
    "label": "Oficina",
    "street": "Av. Santa Fe 1234, Col. Santa Fe",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postalCode": "01210",
    "country": "Mexico",
    "isDefault": false,
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

#### **PUT /user-profile/addresses/:addressId**
Actualiza una dirección existente.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Parámetros:**
- `addressId` (number): ID de la dirección a actualizar

**Body:**
```json
{
  "street": "Av. Santa Fe 5678, Col. Santa Fe",
  "postalCode": "01219"
}
```

#### **DELETE /user-profile/addresses/:addressId**
Elimina una dirección.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Parámetros:**
- `addressId` (number): ID de la dirección a eliminar

**Respuesta:**
```json
{
  "message": "Dirección eliminada exitosamente"
}
```

#### **POST /user-profile/addresses/:addressId/set-default**
Establece una dirección como predeterminada.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Parámetros:**
- `addressId` (number): ID de la dirección a establecer como predeterminada

**Respuesta:**
```json
{
  "message": "Dirección establecida como predeterminada",
  "address": {
    "id": 2,
    "userId": 1,
    "label": "Trabajo",
    "street": "Paseo de la Reforma 456, Col. Juárez",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postalCode": "06600",
    "country": "Mexico",
    "isDefault": true,
    "createdAt": "2024-01-10T00:00:00.000Z",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  }
}
```

## 🔧 **Configuración Requerida**

### **1. Variables de Entorno**
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/chickencore"
```

### **2. Dependencias Adicionales**
```bash
npm install multer @types/multer
```

### **3. Migración de Base de Datos**
```bash
npx prisma migrate dev --name add-user-profile-fields
npx prisma generate
```

### **4. Directorio de Uploads**
Asegúrate de que existe el directorio para las fotos de perfil:
```bash
mkdir -p uploads/profiles
```

## 🚀 **Características Implementadas**

### **✅ Gestión de Perfil**
- Información básica del usuario (nombre, teléfono, biografía, etc.)
- Cálculo automático de completitud del perfil
- Validaciones robustas en todos los campos

### **✅ Fotos de Perfil**
- Subida de archivos con validación de tipo y tamaño
- Eliminación automática de fotos anteriores
- Soporte para JPG, PNG y WebP (máximo 5MB)

### **✅ Direcciones Múltiples**
- CRUD completo de direcciones
- Sistema de dirección predeterminada
- Validación de etiquetas únicas por usuario
- Gestión automática de dirección default

### **✅ Seguridad**
- Todos los endpoints requieren autenticación JWT
- Validación de ownership (usuarios solo acceden a sus datos)
- Sanitización y validación de todos los inputs

## 🔮 **Próximas Mejoras**

### **Funcionalidades Pendientes**
- Verificación de números de teléfono por SMS
- Validación de direcciones con APIs de geocodificación
- Optimización automática de imágenes
- Historial de cambios del perfil
- Configuración de preferencias de notificaciones

### **Mejoras de Rendimiento**
- Cache de perfiles frecuentemente consultados
- Compresión automática de imágenes
- Carga lazy de direcciones

## 📚 **Uso en Frontend**

### **Ejemplo con Axios**
```javascript
// Obtener perfil
const profile = await axios.get('/user-profile', {
  headers: { Authorization: `Bearer ${token}` }
});

// Actualizar perfil
await axios.put('/user-profile', {
  firstName: 'Nuevo Nombre',
  bio: 'Nueva biografía'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Subir foto
const formData = new FormData();
formData.append('file', fileInput.files[0]);

await axios.post('/user-profile/picture', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

---

¿Necesitas ayuda con algún endpoint específico o quieres agregar más funcionalidades? 🚀
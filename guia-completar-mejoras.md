# 🚀 Guía Práctica: Completar las Mejoras Faltantes

## 📋 Checklist de Mejoras Pendientes

- [ ] 1. Crear servicio compartido de geocodificación
- [ ] 2. Integrar validación automática en createAddress
- [ ] 3. Refactorizar casos de uso existentes
- [ ] 4. Crear caso de uso unificado de servicios cercanos
- [ ] 5. Agregar DTOs avanzados
- [ ] 6. Implementar nuevos endpoints
- [ ] 7. Crear decorador de validación
- [ ] 8. Actualizar módulo con nuevas dependencias

---

## 🔧 **PASO 1: Crear Servicio Compartido de Geocodificación**

### 1.1 Crear la carpeta y archivo
```bash
mkdir -p src/modules/user-profile/services
touch src/modules/user-profile/services/geocoding-providers.service.ts
```

### 1.2 Implementar el servicio
```typescript
// src/modules/user-profile/services/geocoding-providers.service.ts
import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';

export interface StandardizedAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  standardizedAddress?: StandardizedAddress;
  coordinates?: Coordinates;
  errors?: string[];
  suggestions?: string[];
}

export interface GeocodeResult {
  success: boolean;
  coordinates?: Coordinates;
  accuracy?: string;
  confidence?: number;
  address?: {
    formatted: string;
    components: StandardizedAddress;
  };
  error?: string;
}

@Injectable()
export class GeocodingProvidersService {
  private readonly TIMEOUT = 5000;
  private readonly USER_AGENT = 'ChickenCore-App/1.0';

  async validateWithNominatim(address: string): Promise<ValidationResult> {
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: address,
            format: 'json',
            addressdetails: 1,
            limit: 1,
          },
          timeout: this.TIMEOUT,
          headers: {
            'User-Agent': this.USER_AGENT,
          },
        },
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          isValid: true,
          confidence: parseFloat(result.importance) || 0.5,
          standardizedAddress: {
            street: result.display_name.split(',')[0],
            city:
              result.address?.city ||
              result.address?.town ||
              result.address?.village ||
              '',
            state: result.address?.state || '',
            postalCode: result.address?.postcode || '',
            country: result.address?.country || 'Mexico',
          },
          coordinates: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          },
        };
      }

      return {
        isValid: false,
        confidence: 0.2,
        errors: ['Dirección no encontrada'],
      };
    } catch (error) {
      throw new ServiceUnavailableException(
        'Servicio de validación Nominatim no disponible',
      );
    }
  }

  async geocodeWithNominatim(address: string): Promise<GeocodeResult> {
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: address,
            format: 'json',
            addressdetails: 1,
            limit: 1,
          },
          timeout: this.TIMEOUT,
          headers: {
            'User-Agent': this.USER_AGENT,
          },
        },
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          success: true,
          coordinates: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          },
          accuracy: this.getAccuracyFromImportance(result.importance),
          confidence: parseFloat(result.importance) || 0.5,
          address: {
            formatted: result.display_name,
            components: {
              street: result.address?.road || result.address?.house_number || '',
              city:
                result.address?.city ||
                result.address?.town ||
                result.address?.village ||
                '',
              state: result.address?.state || '',
              postalCode: result.address?.postcode || '',
              country: result.address?.country || '',
            },
          },
        };
      }

      return {
        success: false,
        error: 'Dirección no encontrada en Nominatim',
      };
    } catch (error) {
      throw new ServiceUnavailableException('Servicio Nominatim no disponible');
    }
  }

  async validateWithOpenCage(address: string): Promise<ValidationResult> {
    // TODO: Implementar cuando se tenga la API key
    return {
      isValid: false,
      confidence: 0.1,
      errors: ['Servicio OpenCage no configurado - API key requerida'],
    };
  }

  async geocodeWithOpenCage(address: string): Promise<GeocodeResult> {
    // TODO: Implementar cuando se tenga la API key
    return {
      success: false,
      error: 'Servicio OpenCage no configurado - API key requerida',
    };
  }

  private getAccuracyFromImportance(importance: number): string {
    if (importance > 0.8) return 'high';
    if (importance > 0.5) return 'medium';
    return 'low';
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 🔧 **PASO 2: Integrar Validación Automática**

### 2.1 Actualizar ManageAddressesUseCase

**Editar:** `src/modules/user-profile/use-cases/address/manage-addresses.use-case.ts`

**Agregar la importación:**
```typescript
import { ValidateAddressUseCase } from './validate-address.use-case';
```

**Actualizar el constructor:**
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly validateAddressUseCase: ValidateAddressUseCase,
) {}
```

**Reemplazar el método createAddress:**
```typescript
async createAddress(userId: number, createAddressDto: CreateAddressDto) {
  // Verificar que el usuario existe
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  // Validar dirección automáticamente antes de crear
  let addressToSave = createAddressDto;
  let validationWarnings: string[] = [];

  try {
    const validationResult = await this.validateAddressUseCase.execute(createAddressDto);
    
    // Si la validación falla con baja confianza, lanzar error
    if (!validationResult.isValid && validationResult.confidence < 0.5) {
      throw new BadRequestException({
        message: 'Dirección inválida',
        errors: validationResult.errors,
        suggestions: validationResult.suggestions,
      });
    }

    // Si hay una dirección estandarizada, usarla
    if (validationResult.standardizedAddress && validationResult.confidence > 0.7) {
      addressToSave = {
        ...createAddressDto,
        street: validationResult.standardizedAddress.street || createAddressDto.street,
        city: validationResult.standardizedAddress.city || createAddressDto.city,
        state: validationResult.standardizedAddress.state || createAddressDto.state,
        postalCode: validationResult.standardizedAddress.postalCode || createAddressDto.postalCode,
        country: validationResult.standardizedAddress.country || createAddressDto.country,
      };
    }

    // Agregar warnings si la confianza es media
    if (validationResult.confidence < 0.7 && validationResult.suggestions) {
      validationWarnings = validationResult.suggestions;
    }
  } catch (error) {
    // Si hay error en la validación externa, continuar con la dirección original
    console.warn('Error en validación automática:', error);
    validationWarnings = ['No se pudo validar la dirección con servicios externos'];
  }

  // Verificar que no existe una dirección con el mismo label
  const existingAddress = await this.prisma.address.findFirst({
    where: {
      userId,
      label: addressToSave.label,
    },
  });

  if (existingAddress) {
    throw new ConflictException(
      `Ya existe una dirección con la etiqueta "${addressToSave.label}"`,
    );
  }

  // Si es la primera dirección o se marca como default, actualizar otras direcciones
  if (addressToSave.isDefault) {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // Verificar si es la primera dirección del usuario
  const addressCount = await this.prisma.address.count({
    where: { userId },
  });

  const newAddress = await this.prisma.address.create({
    data: {
      userId,
      label: addressToSave.label,
      street: addressToSave.street,
      city: addressToSave.city,
      state: addressToSave.state,
      postalCode: addressToSave.postalCode,
      country: addressToSave.country || 'Mexico',
      isDefault: addressToSave.isDefault || addressCount === 0,
    },
  });

  // Si esta dirección es default, actualizar la referencia en User
  if (newAddress.isDefault) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { defaultAddressId: newAddress.id },
    });
  }

  const result: any = {
    message: 'Dirección creada exitosamente',
    address: newAddress,
  };

  // Incluir warnings de validación si los hay
  if (validationWarnings.length > 0) {
    result.warnings = validationWarnings;
    result.message += ' (con advertencias de validación)';
  }

  return result;
}
```

---

## 🔧 **PASO 3: Refactorizar Casos de Uso Existentes**

### 3.1 Actualizar ValidateAddressUseCase

**Editar:** `src/modules/user-profile/use-cases/address/validate-address.use-case.ts`

**Reemplazar las importaciones:**
```typescript
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { CreateAddressDto } from '../../dto/create-address.dto';
import { 
  GeocodingProvidersService, 
  ValidationResult 
} from '../../services/geocoding-providers.service';
```

**Actualizar el constructor:**
```typescript
constructor(
  private readonly geocodingProviders: GeocodingProvidersService,
) {}
```

**Reemplazar en validateWithExternalServices:**
```typescript
const results = await Promise.allSettled([
  this.geocodingProviders.validateWithNominatim(fullAddress),
  this.geocodingProviders.validateWithOpenCage(fullAddress),
]);
```

**Eliminar métodos duplicados:**
- Eliminar `validateWithNominatim`
- Eliminar `validateWithOpenCage`

### 3.2 Actualizar GeocodeAddressUseCase

**Editar:** `src/modules/user-profile/use-cases/address/geocode-address.use-case.ts`

**Reemplazar las importaciones:**
```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { 
  GeocodingProvidersService, 
  GeocodeResult 
} from '../../services/geocoding-providers.service';
```

**Actualizar el constructor:**
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly geocodingProviders: GeocodingProvidersService,
) {}
```

**Reemplazar en geocodeAddress:**
```typescript
const results = await Promise.allSettled([
  this.geocodingProviders.geocodeWithNominatim(fullAddress),
  this.geocodingProviders.geocodeWithOpenCage(fullAddress),
]);
```

**Reemplazar llamadas a sleep:**
```typescript
await this.geocodingProviders.sleep(200);
```

**Eliminar métodos duplicados:**
- Eliminar `geocodeWithNominatim`
- Eliminar `geocodeWithOpenCage`
- Eliminar `getAccuracyFromImportance`
- Eliminar `sleep`

---

## 🔧 **PASO 4: Actualizar el Módulo**

**Editar:** `src/modules/user-profile/user-profile.module.ts`

**Agregar importación:**
```typescript
import { GeocodingProvidersService } from './services/geocoding-providers.service';
```

**Actualizar providers:**
```typescript
providers: [
  // Servicio principal
  UserProfileService,
  
  // Servicios compartidos
  GeocodingProvidersService,
  
  // Casos de uso básicos
  GetUserProfileUseCase,
  UpdateProfileUseCase,
  UploadProfilePictureUseCase,
  
  // Casos de uso de direcciones
  ManageAddressesUseCase,
  ValidateAddressUseCase,
  GeocodeAddressUseCase,
],

exports: [
  // Exportar servicios que podrían ser útiles en otros módulos
  GeocodingProvidersService,
  ValidateAddressUseCase,
  GeocodeAddressUseCase,
],
```

---

## 🔧 **PASO 5: Probar la Implementación**

### 5.1 Compilar el proyecto
```bash
npm run build
```

### 5.2 Probar endpoint de creación con validación automática
```bash
curl -X POST http://localhost:3000/user-profile/addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "label": "Casa",
    "street": "insurgentes 123",
    "city": "cdmx", 
    "state": "df",
    "postalCode": "06000"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Dirección creada exitosamente (con advertencias de validación)",
  "address": {
    "id": 1,
    "street": "Av. Insurgentes Sur 123",  // ← Estandarizada
    "city": "Ciudad de México",           // ← Estandarizada
    "state": "CDMX",
    "postalCode": "06000",
    "country": "Mexico"
  },
  "warnings": [
    "Verifica que el código postal sea correcto"
  ]
}
```

---

## ✅ **Checkpoint: Lo que habrás logrado**

Después de completar estos pasos:

- ✅ **Código duplicado eliminado** entre casos de uso
- ✅ **Validación automática** funcionando al crear direcciones
- ✅ **Estandarización automática** de direcciones con alta confianza
- ✅ **Warnings informativos** para direcciones con confianza media
- ✅ **Arquitectura más limpia** y mantenible

---

## 🚀 **Siguientes Pasos Opcionales**

Una vez completados estos pasos básicos, puedes continuar con:

1. **Caso de uso unificado de servicios cercanos**
2. **DTOs avanzados**
3. **Nuevos endpoints de servicios cercanos**
4. **Decorador de validación**

Cada mejora adicional es incremental y no afecta la funcionalidad existente.

---

## 🆘 **Troubleshooting**

### Error de compilación
```bash
# Si hay errores de importación
npm install

# Si hay errores de tipos
npm run build -- --skip-type-check
```

### Error en tests
```bash
# Ejecutar tests
npm run test

# Si fallan, actualizar los mocks en los tests
```

### Error en runtime
- Verificar que todas las dependencias estén en el módulo
- Revisar que las importaciones sean correctas
- Verificar que Prisma esté configurado correctamente

---

**¡Con esto tendrás una implementación mucho más robusta y mantenible!** 🎉
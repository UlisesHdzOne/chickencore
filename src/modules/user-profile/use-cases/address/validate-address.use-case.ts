import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { CreateAddressDto } from '../../dto/create-address.dto';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  standardizedAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  errors?: string[];
  suggestions?: string[];
}

@Injectable()
export class ValidateAddressUseCase {
  constructor() {}

  async execute(addressData: CreateAddressDto): Promise<ValidationResult> {
    try {
      // Validación básica local
      const basicValidation = this.validateBasicFormat(addressData);
      if (!basicValidation.isValid) {
        return basicValidation;
      }

      // Validación con servicios externos
      const externalValidation =
        await this.validateWithExternalServices(addressData);

      return externalValidation;
    } catch (error) {
      console.error('Error en validación de dirección:', error);
      throw new BadRequestException(
        'Error al validar la dirección. Inténtalo de nuevo.',
      );
    }
  }

  private validateBasicFormat(addressData: CreateAddressDto): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validar campos requeridos
    if (!addressData.street || addressData.street.trim().length < 5) {
      errors.push('La calle debe tener al menos 5 caracteres');
    }

    if (!addressData.city || addressData.city.trim().length < 2) {
      errors.push('La ciudad debe tener al menos 2 caracteres');
    }

    if (!addressData.state || addressData.state.trim().length < 2) {
      errors.push('El estado debe tener al menos 2 caracteres');
    }

    if (
      !addressData.postalCode ||
      !this.validatePostalCode(addressData.postalCode)
    ) {
      errors.push('El código postal no tiene un formato válido');
    }

    // Validaciones específicas para México
    if (addressData.country === 'Mexico' || !addressData.country) {
      if (
        addressData.postalCode &&
        !this.validateMexicanPostalCode(addressData.postalCode)
      ) {
        errors.push('El código postal no es válido para México');
        suggestions.push(
          'Los códigos postales en México deben tener 5 dígitos',
        );
      }

      if (addressData.state && !this.validateMexicanState(addressData.state)) {
        suggestions.push('Verifica que el estado esté correctamente escrito');
      }
    }

    // Validar caracteres especiales
    if (this.hasInvalidCharacters(addressData.street)) {
      errors.push('La calle contiene caracteres no válidos');
    }

    return {
      isValid: errors.length === 0,
      confidence: errors.length === 0 ? 0.7 : 0.3,
      errors: errors.length > 0 ? errors : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  private async validateWithExternalServices(
    addressData: CreateAddressDto,
  ): Promise<ValidationResult> {
    // Construir dirección completa para geocodificación
    const fullAddress = `${addressData.street}, ${addressData.city}, ${addressData.state} ${addressData.postalCode}, ${addressData.country || 'Mexico'}`;

    try {
      // Intentar con múltiples servicios
      const results = await Promise.allSettled([
        this.validateWithNominatim(fullAddress),
        this.validateWithOpenCage(fullAddress),
      ]);

      // Procesar resultados
      const successfulResults = results
        .filter(
          (result): result is PromiseFulfilledResult<ValidationResult> =>
            result.status === 'fulfilled' && result.value.isValid,
        )
        .map((result) => result.value);

      if (successfulResults.length > 0) {
        // Retornar el mejor resultado
        return successfulResults.reduce((best, current) =>
          current.confidence > best.confidence ? current : best,
        );
      }

      // Si no hay resultados exitosos, retornar validación básica
      return {
        isValid: false,
        confidence: 0.3,
        errors: ['No se pudo validar la dirección con servicios externos'],
        suggestions: [
          'Verifica que la dirección esté correctamente escrita',
          'Intenta con un formato más específico',
        ],
      };
    } catch (error) {
      console.error('Error en validación externa:', error);
      // Retornar validación básica en caso de error
      return this.validateBasicFormat(addressData);
    }
  }

  private async validateWithNominatim(
    address: string,
  ): Promise<ValidationResult> {
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
          timeout: 5000,
          headers: {
            'User-Agent': 'ChickenCore-App/1.0',
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
        'Servicio de validación no disponible',
      );
    }
  }

  private async validateWithOpenCage(
    address: string,
  ): Promise<ValidationResult> {
    // Nota: Requiere API key para uso en producción
    // Por ahora retornamos un mock para desarrollo
    return {
      isValid: false,
      confidence: 0.1,
      errors: ['Servicio OpenCage no configurado'],
    };
  }

  private validatePostalCode(postalCode: string): boolean {
    // Validación básica - solo números y guiones
    return /^[\d-]+$/.test(postalCode);
  }

  private validateMexicanPostalCode(postalCode: string): boolean {
    // Códigos postales mexicanos: 5 dígitos
    return /^\d{5}$/.test(postalCode);
  }

  private validateMexicanState(state: string): boolean {
    const mexicanStates = [
      'Aguascalientes',
      'Baja California',
      'Baja California Sur',
      'Campeche',
      'Chiapas',
      'Chihuahua',
      'Coahuila',
      'Colima',
      'Durango',
      'Guanajuato',
      'Guerrero',
      'Hidalgo',
      'Jalisco',
      'México',
      'Michoacán',
      'Morelos',
      'Nayarit',
      'Nuevo León',
      'Oaxaca',
      'Puebla',
      'Querétaro',
      'Quintana Roo',
      'San Luis Potosí',
      'Sinaloa',
      'Sonora',
      'Tabasco',
      'Tamaulipas',
      'Tlaxcala',
      'Veracruz',
      'Yucatán',
      'Zacatecas',
      'Ciudad de México',
    ];

    return mexicanStates.some(
      (validState) => validState.toLowerCase() === state.toLowerCase(),
    );
  }

  private hasInvalidCharacters(text: string): boolean {
    // Permitir letras, números, espacios y algunos caracteres especiales comunes
    return !/^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s\-#.,]+$/.test(text);
  }
}

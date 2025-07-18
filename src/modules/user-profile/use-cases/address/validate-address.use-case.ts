import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAddressDto } from '../../dto/create-address.dto';
import {
  GeocodingProvidersService,
  ValidationResult,
} from '../../services/geocoding-providers.service';
import { AddressValidator } from '../../utils/address-validator';

@Injectable()
export class ValidateAddressUseCase {
  constructor(private readonly geocodingProviders: GeocodingProvidersService) {}

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
      !AddressValidator.validatePostalCode(addressData.postalCode)
    ) {
      errors.push('El código postal no tiene un formato válido');
    }

    // Validaciones específicas para México
    if (addressData.country === 'Mexico' || !addressData.country) {
      if (
        addressData.postalCode &&
        !AddressValidator.validateMexicanPostalCode(addressData.postalCode)
      ) {
        errors.push('El código postal no es válido para México');
        suggestions.push(
          'Los códigos postales en México deben tener 5 dígitos',
        );
      }

      if (
        addressData.state &&
        !AddressValidator.validateMexicanState(addressData.state)
      ) {
        suggestions.push('Verifica que el estado esté correctamente escrito');
      }
    }

    // Validar caracteres especiales
    if (AddressValidator.hasInvalidCharacters(addressData.street)) {
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
    const fullAddress = `${addressData.street}, ${addressData.city}, ${addressData.state} ${addressData.postalCode}, ${addressData.country || 'Mexico'}`;

    try {
      const results = await Promise.allSettled([
        this.geocodingProviders.validateWithNominatim(fullAddress),
        this.geocodingProviders.validateWithOpenCage(fullAddress),
      ]);

      const successfulResults = results
        .filter(
          (result): result is PromiseFulfilledResult<ValidationResult> =>
            result.status === 'fulfilled' && result.value.isValid,
        )
        .map((result) => result.value);

      if (successfulResults.length > 0) {
        return successfulResults.reduce((best, current) =>
          current.confidence > best.confidence ? current : best,
        );
      }

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
      return this.validateBasicFormat(addressData);
    }
  }
}

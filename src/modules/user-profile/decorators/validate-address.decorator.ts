import {
  Injectable,
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * DTO parcial para dirección, usado internamente
 */
interface PartialAddressDto {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Decorador para aplicar validación automática de direcciones
 */
export function ValidateAddress(
  options: {
    autoStandardize?: boolean;
    minConfidence?: number;
    throwOnLowConfidence?: boolean;
  } = {},
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const {
        autoStandardize = true,
        minConfidence = 0.5,
        throwOnLowConfidence = false,
      } = options;

      let addressData: PartialAddressDto | null = null;
      let addressIndex = -1;

      for (let i = 0; i < args.length; i++) {
        if (args[i] && typeof args[i] === 'object' && 'street' in args[i]) {
          addressData = args[i];
          addressIndex = i;
          break;
        }
      }

      if (!addressData) return method.apply(this, args);

      try {
        const validateAddressUseCase = this.validateAddressUseCase;
        if (!validateAddressUseCase) {
          console.warn('ValidateAddressUseCase no disponible en el contexto');
          return method.apply(this, args);
        }

        const validationResult =
          await validateAddressUseCase.execute(addressData);

        if (
          throwOnLowConfidence &&
          validationResult.confidence < minConfidence
        ) {
          throw new BadRequestException({
            message: 'Dirección con baja confianza de validación',
            errors: validationResult.errors,
            suggestions: validationResult.suggestions,
            confidence: validationResult.confidence,
          });
        }

        if (
          autoStandardize &&
          validationResult.standardizedAddress &&
          validationResult.confidence > 0.7
        ) {
          args[addressIndex] = {
            ...(addressData || {}),
            street:
              validationResult.standardizedAddress.street ||
              addressData?.street,
            city:
              validationResult.standardizedAddress.city || addressData?.city,
            state:
              validationResult.standardizedAddress.state || addressData?.state,
            postalCode:
              validationResult.standardizedAddress.postalCode ||
              addressData?.postalCode,
            country:
              validationResult.standardizedAddress.country ||
              addressData?.country,
          };
        }

        const result = await method.apply(this, args);

        if (result && typeof result === 'object') {
          if (
            validationResult.confidence < 0.7 &&
            validationResult.suggestions
          ) {
            result.validationWarnings = validationResult.suggestions;
          }
          result.validationConfidence = validationResult.confidence;
        }

        return result;
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        console.warn('Error en validación automática (decorador):', error);
        return method.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Interceptor alternativo para validación de direcciones (placeholder)
 */
@Injectable()
export class AddressValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly options: {
      autoStandardize?: boolean;
      minConfidence?: number;
      throwOnLowConfidence?: boolean;
    } = {},
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (!body || !body.street) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => data),
      catchError((error) => of(error)),
    );
  }
}

/**
 * Tipo helper para DTOs validados
 */
export interface ValidatedAddressDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  label?: string;
  isDefault?: boolean;
  validationConfidence?: number;
  validationWarnings?: string[];
}

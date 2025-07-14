import { Injectable, ServiceUnavailableException } from '@nestjs/common';
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
              street:
                result.address?.road || result.address?.house_number || '',
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
    // Por ahora retornamos un mock para desarrollo
    return {
      isValid: false,
      confidence: 0.1,
      errors: ['Servicio OpenCage no configurado - API key requerida'],
    };
  }

  async geocodeWithOpenCage(address: string): Promise<GeocodeResult> {
    // TODO: Implementar cuando se tenga la API key
    // Por ahora retornamos un mock para desarrollo
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

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import axios from 'axios';

export interface GeocodeResult {
  success: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  accuracy?: string;
  confidence?: number;
  address?: {
    formatted: string;
    components: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  error?: string;
}

@Injectable()
export class GeocodeAddressUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, addressId: number): Promise<GeocodeResult> {
    try {
      // Verificar que la dirección existe y pertenece al usuario
      const address = await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId: userId,
        },
      });

      if (!address) {
        throw new NotFoundException('Dirección no encontrada');
      }

      // Verificar si ya tiene coordenadas válidas
      if (address.latitude && address.longitude) {
        return {
          success: true,
          coordinates: {
            latitude: address.latitude,
            longitude: address.longitude,
          },
          accuracy: 'cached',
          confidence: 1.0,
          address: {
            formatted: this.formatAddress(address),
            components: {
              street: address.street,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
            },
          },
        };
      }

      // Geocodificar la dirección
      const geocodeResult = await this.geocodeAddress(address);

      if (geocodeResult.success && geocodeResult.coordinates) {
        // Guardar coordenadas en la base de datos
        await this.prisma.address.update({
          where: { id: addressId },
          data: {
            latitude: geocodeResult.coordinates.latitude,
            longitude: geocodeResult.coordinates.longitude,
            isValidated: true,
            validationDate: new Date(),
          },
        });
      }

      return geocodeResult;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en geocodificación:', error);
      throw new BadRequestException(
        'Error al geocodificar la dirección. Inténtalo de nuevo.',
      );
    }
  }

  async geocodeBatch(userId: number): Promise<{
    processed: number;
    successful: number;
    failed: number;
    results: Array<{ addressId: number; result: GeocodeResult }>;
  }> {
    try {
      // Obtener todas las direcciones del usuario sin coordenadas
      const addresses = await this.prisma.address.findMany({
        where: {
          userId: userId,
          OR: [{ latitude: null }, { longitude: null }],
        },
      });

      const results: Array<{ addressId: number; result: GeocodeResult }> = [];
      let successful = 0;
      let failed = 0;

      for (const address of addresses) {
        try {
          const geocodeResult = await this.geocodeAddress(address);

          if (geocodeResult.success && geocodeResult.coordinates) {
            await this.prisma.address.update({
              where: { id: address.id },
              data: {
                latitude: geocodeResult.coordinates.latitude,
                longitude: geocodeResult.coordinates.longitude,
                isValidated: true,
                validationDate: new Date(),
              },
            });
            successful++;
          } else {
            failed++;
          }

          results.push({
            addressId: address.id,
            result: geocodeResult,
          });

          // Pequeña pausa para evitar rate limiting
          await this.sleep(200);
        } catch (error) {
          failed++;
          results.push({
            addressId: address.id,
            result: {
              success: false,
              error: 'Error al procesar la dirección',
            },
          });
        }
      }

      return {
        processed: addresses.length,
        successful,
        failed,
        results,
      };
    } catch (error) {
      console.error('Error en geocodificación batch:', error);
      throw new BadRequestException(
        'Error al procesar las direcciones. Inténtalo de nuevo.',
      );
    }
  }

  private async geocodeAddress(address: any): Promise<GeocodeResult> {
    const fullAddress = this.formatAddress(address);

    try {
      // Intentar con múltiples servicios
      const results = await Promise.allSettled([
        this.geocodeWithNominatim(fullAddress),
        this.geocodeWithOpenCage(fullAddress),
      ]);

      // Procesar resultados
      const successfulResults = results
        .filter(
          (result): result is PromiseFulfilledResult<GeocodeResult> =>
            result.status === 'fulfilled' && result.value.success,
        )
        .map((result) => result.value);

      if (successfulResults.length > 0) {
        // Retornar el mejor resultado
        return successfulResults.reduce((best, current) =>
          (current.confidence || 0) > (best.confidence || 0) ? current : best,
        );
      }

      return {
        success: false,
        error: 'No se pudo geocodificar la dirección con ningún servicio',
      };
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return {
        success: false,
        error: 'Error interno al geocodificar la dirección',
      };
    }
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodeResult> {
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
              street: result.address?.road || result.address?.house_number,
              city:
                result.address?.city ||
                result.address?.town ||
                result.address?.village,
              state: result.address?.state,
              postalCode: result.address?.postcode,
              country: result.address?.country,
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

  private async geocodeWithOpenCage(address: string): Promise<GeocodeResult> {
    // Nota: Requiere API key para uso en producción
    // Por ahora retornamos un mock para desarrollo
    return {
      success: false,
      error: 'Servicio OpenCage no configurado',
    };
  }

  private formatAddress(address: any): string {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  }

  private getAccuracyFromImportance(importance: number): string {
    if (importance >= 0.7) return 'high';
    if (importance >= 0.4) return 'medium';
    return 'low';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Método para obtener direcciones cerca de una ubicación
  async getNearbyAddresses(
    userId: number,
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<any[]> {
    try {
      const query = `
  SELECT * FROM (
    SELECT *, 
      (6371 * acos(
        cos(radians(${latitude})) 
        * cos(radians(latitude)) 
        * cos(radians(longitude) - radians(${longitude})) 
        + sin(radians(${latitude})) 
        * sin(radians(latitude))
      )) AS distance
    FROM "Address"
    WHERE "userId" = ${userId}
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
  ) AS subquery
  WHERE distance < ${radiusKm}
  ORDER BY distance;
`;

      const addresses = await this.prisma.$queryRawUnsafe(query);

      return addresses as any[];
    } catch (error) {
      console.error('Error al buscar direcciones cercanas:', error);
      throw new BadRequestException('Error al buscar direcciones cercanas');
    }
  }

  async getNearbyAddressesFromString(
    userId: number,
    coordinates: string,
    radiusKm = 5,
  ) {
    const [lat, lng] = coordinates.split(',').map(parseFloat);

    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('Coordenadas inválidas');
    }

    return this.getNearbyAddresses(userId, lat, lng, radiusKm);
  }
}

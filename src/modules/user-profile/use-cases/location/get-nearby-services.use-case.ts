import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GeocodingProvidersService } from '../../services/geocoding-providers.service';

export interface NearbyOptions {
  radius?: number; // en kilómetros
  serviceTypes?: string[]; // tipos de servicios a buscar
  includeAddresses?: boolean; // incluir direcciones del usuario
  limit?: number; // límite de resultados
}

export interface NearbyResult {
  addresses?: any[];
  services?: any[];
  totalFound: number;
  searchRadius: number;
  center: {
    latitude: number;
    longitude: number;
  };
}

@Injectable()
export class GetNearbyServicesUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingProviders: GeocodingProvidersService,
  ) {}

  async execute(
    userId: number,
    coordinates: { latitude: number; longitude: number },
    options: NearbyOptions = {},
  ): Promise<NearbyResult> {
    const {
      radius = 5,
      serviceTypes = [],
      includeAddresses = true,
      limit = 50,
    } = options;

    try {
      const result: NearbyResult = {
        totalFound: 0,
        searchRadius: radius,
        center: coordinates,
      };

      // Obtener direcciones cercanas del usuario si está habilitado
      if (includeAddresses) {
        result.addresses = await this.getNearbyUserAddresses(
          userId,
          coordinates.latitude,
          coordinates.longitude,
          radius,
        );
        result.totalFound += result.addresses.length;
      }

      // Obtener servicios cercanos (placeholder para futura implementación)
      if (serviceTypes.length > 0) {
        result.services = await this.getNearbyExternalServices(
          coordinates,
          serviceTypes,
          radius,
          limit,
        );
        result.totalFound += result.services?.length || 0;
      }

      return result;
    } catch (error) {
      console.error('Error al obtener servicios cercanos:', error);
      throw new BadRequestException(
        'Error al buscar servicios cercanos. Inténtalo de nuevo.',
      );
    }
  }

  async executeFromAddress(
    userId: number,
    addressId: number,
    options: NearbyOptions = {},
  ): Promise<NearbyResult> {
    // Obtener las coordenadas de la dirección
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId,
      },
    });

    if (!address) {
      throw new BadRequestException('Dirección no encontrada');
    }

    if (!address.latitude || !address.longitude) {
      throw new BadRequestException(
        'La dirección no tiene coordenadas. Geocodifica primero.',
      );
    }

    return this.execute(
      userId,
      {
        latitude: address.latitude,
        longitude: address.longitude,
      },
      options,
    );
  }

  async executeFromCoordinatesString(
    userId: number,
    coordinatesString: string,
    options: NearbyOptions = {},
  ): Promise<NearbyResult> {
    const coordinates = this.parseCoordinates(coordinatesString);
    return this.execute(userId, coordinates, options);
  }

  private async getNearbyUserAddresses(
    userId: number,
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<any[]> {
    // Fórmula de Haversine para calcular distancia
    // 1 grado ≈ 111 km, entonces radius en grados ≈ radiusKm / 111
    const radiusDegrees = radiusKm / 111;

    const addresses = await this.prisma.address.findMany({
      where: {
        userId: userId,
        latitude: {
          not: null,
          gte: latitude - radiusDegrees,
          lte: latitude + radiusDegrees,
        },
        longitude: {
          not: null,
          gte: longitude - radiusDegrees,
          lte: longitude + radiusDegrees,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrar por distancia exacta y agregar información de distancia
    return addresses
      .map((address) => {
        if (!address.latitude || !address.longitude) return null;

        const distance = this.calculateDistance(
          latitude,
          longitude,
          address.latitude,
          address.longitude,
        );

        if (distance <= radiusKm) {
          return {
            ...address,
            distance: Math.round(distance * 100) / 100, // redondear a 2 decimales
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance); // ordenar por distancia
  }

  private async getNearbyExternalServices(
    coordinates: { latitude: number; longitude: number },
    serviceTypes: string[],
    radius: number,
    limit: number,
  ): Promise<any[]> {
    // TODO: Implementar integración con APIs de servicios externos
    // Por ejemplo: Google Places API, Foursquare, etc.

    console.log(
      `Buscando servicios ${serviceTypes.join(', ')} en radio de ${radius}km desde ${coordinates.latitude}, ${coordinates.longitude}`,
    );

    // Por ahora retornamos un array vacío
    // En una implementación real, aquí harías llamadas a APIs externas
    return [];
  }

  private parseCoordinates(coordinatesString: string): {
    latitude: number;
    longitude: number;
  } {
    try {
      // Soportar formatos: "lat,lng" o "lat lng" o JSON
      let lat: number, lng: number;

      if (coordinatesString.includes(',')) {
        const [latStr, lngStr] = coordinatesString.split(',');
        lat = parseFloat(latStr.trim());
        lng = parseFloat(lngStr.trim());
      } else if (coordinatesString.includes(' ')) {
        const [latStr, lngStr] = coordinatesString.split(' ');
        lat = parseFloat(latStr.trim());
        lng = parseFloat(lngStr.trim());
      } else {
        // Intentar parsear como JSON
        const parsed = JSON.parse(coordinatesString);
        lat = parsed.latitude || parsed.lat;
        lng = parsed.longitude || parsed.lng;
      }

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Coordenadas inválidas');
      }

      // Validar rangos
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Coordenadas fuera de rango');
      }

      return { latitude: lat, longitude: lng };
    } catch (error) {
      throw new BadRequestException(
        'Formato de coordenadas inválido. Usa "lat,lng" o "lat lng"',
      );
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Fórmula de Haversine para calcular distancia entre dos puntos
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en kilómetros
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

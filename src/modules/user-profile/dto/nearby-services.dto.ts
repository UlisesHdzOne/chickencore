import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class NearbyServicesDto {
  @ApiProperty({
    description: 'Coordenadas en formato "lat,lng" o "lat lng"',
    example: '19.4326,-99.1332',
  })
  @IsString()
  coordinates: string;

  @ApiPropertyOptional({
    description: 'Radio de búsqueda en kilómetros',
    minimum: 0.1,
    maximum: 50,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  @Max(50)
  radius?: number = 5;

  @ApiPropertyOptional({
    description: 'Tipos de servicios a buscar',
    example: ['restaurant', 'hospital', 'gas_station'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceTypes?: string[] = [];

  @ApiPropertyOptional({
    description: 'Incluir direcciones del usuario en los resultados',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  includeAddresses?: boolean = true;

  @ApiPropertyOptional({
    description: 'Límite máximo de resultados',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class NearbyServicesByAddressDto {
  @ApiPropertyOptional({
    description: 'Radio de búsqueda en kilómetros',
    minimum: 0.1,
    maximum: 50,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  @Max(50)
  radius?: number = 5;

  @ApiPropertyOptional({
    description: 'Tipos de servicios a buscar',
    example: ['restaurant', 'hospital', 'gas_station'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceTypes?: string[] = [];

  @ApiPropertyOptional({
    description: 'Incluir direcciones del usuario en los resultados',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  includeAddresses?: boolean = true;

  @ApiPropertyOptional({
    description: 'Límite máximo de resultados',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class CoordinatesDto {
  @ApiProperty({
    description: 'Latitud',
    minimum: -90,
    maximum: 90,
    example: 19.4326,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitud',
    minimum: -180,
    maximum: 180,
    example: -99.1332,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class NearbyServicesByCoordinatesDto {
  @ApiProperty({
    description: 'Coordenadas exactas',
    type: CoordinatesDto,
  })
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @ApiPropertyOptional({
    description: 'Radio de búsqueda en kilómetros',
    minimum: 0.1,
    maximum: 50,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  @Max(50)
  radius?: number = 5;

  @ApiPropertyOptional({
    description: 'Tipos de servicios a buscar',
    example: ['restaurant', 'hospital', 'gas_station'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceTypes?: string[] = [];

  @ApiPropertyOptional({
    description: 'Incluir direcciones del usuario en los resultados',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  includeAddresses?: boolean = true;

  @ApiPropertyOptional({
    description: 'Límite máximo de resultados',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

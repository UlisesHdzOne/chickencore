import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class NearbyCoordinatesDto {
  @ApiProperty({
    example: '19.4180699,-99.1646834',
    description: 'Coordenadas separadas por coma: latitud,longitud',
  })
  @IsString()
  @Matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, {
    message: 'Formato inválido, usa "lat,lng"',
  })
  coordinates: string;
}

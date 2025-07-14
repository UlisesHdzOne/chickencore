import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class NearbyCoordinatesDto {
  @ApiProperty({
    example: '16.700930599045403,-93.00893913210207',
    description: 'Coordenadas separadas por coma: latitud,longitud',
  })
  @IsString()
  @Matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, {
    message: 'Formato inválido, usa "lat,lng"',
  })
  coordinates: string;
}

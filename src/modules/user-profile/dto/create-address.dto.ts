import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({
    example: 'Casa',
    description: 'Etiqueta para identificar la dirección (Casa, Trabajo, etc.)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  label: string;

  @ApiProperty({
    example: 'Av. Insurgentes Sur 123, Col. Roma Norte',
    description: 'Dirección completa (calle y número)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  street: string;

  @ApiProperty({
    example: 'Ciudad de México',
    description: 'Ciudad',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({
    example: 'CDMX',
    description: 'Estado o provincia',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  state: string;

  @ApiProperty({
    example: '06700',
    description: 'Código postal',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(10)
  postalCode: string;

  @ApiProperty({
    example: 'Mexico',
    description: 'País',
    required: false,
    default: 'Mexico',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  country?: string;

  @ApiProperty({
    example: false,
    description: 'Establecer como dirección predeterminada',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    example: '+52 55 1234 5678',
    description: 'Número de teléfono',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Número de teléfono debe ser válido',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Fecha de nacimiento (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    example: 'Desarrollador apasionado por la tecnología...',
    description: 'Biografía o descripción personal',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}

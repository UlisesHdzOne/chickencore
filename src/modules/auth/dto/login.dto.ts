import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Correo electrónico válido del usuario',
  })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña del usuario',
    minLength: 8,
    maxLength: 32,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(32, { message: 'La contraseña no puede exceder 32 caracteres' })
  password: string;

  @IsOptional()
  deviceInfo?: string;

  @IsOptional()
  ipAddress?: string;

  @IsOptional()
  userAgent?: string;
}

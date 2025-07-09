import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckPasswordStrengthDto {
  @ApiProperty({
    example: 'M1Contraseña!',
    description: 'Contraseña a evaluar. Debe tener al menos 1 carácter.',
  })
  @IsString()
  @MinLength(1, { message: 'La contraseña no puede estar vacía' })
  password: string;
}

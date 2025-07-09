import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationEmailDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario a verificar',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class EnableTwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de verificación de 6 dígitos del autenticador',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  verificationCode: string;
}

export class VerifyTwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de verificación de 6 dígitos del autenticador',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  code: string;
}

export class DisableTwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de verificación de 6 dígitos del autenticador',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  verificationCode: string;
}
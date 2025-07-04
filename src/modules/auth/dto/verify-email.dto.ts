import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'abc123def456',
    description: 'Token de verificación de email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class SendVerificationEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario para reenviar verificación',
  })
  @IsEmail()
  email: string;
}
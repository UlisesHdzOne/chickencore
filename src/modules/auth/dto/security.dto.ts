import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CheckPasswordStrengthDto {
  @ApiProperty({
    example: 'MyStrongPassword123!',
    description: 'Contraseña a validar',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ValidateTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT a validar',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class GetSecurityLogsDto {
  @ApiProperty({
    example: 1,
    description: 'Página de resultados',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de elementos por página',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
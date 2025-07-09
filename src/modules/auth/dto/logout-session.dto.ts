import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutSessionDto {
  @ApiProperty({
    description: 'ID de la sesión que se desea cerrar',
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
  })
  @IsString()
  sessionId: string;
}

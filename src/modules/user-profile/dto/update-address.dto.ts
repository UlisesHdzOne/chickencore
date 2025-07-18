import {
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAddressDto {
  @ApiPropertyOptional({
    example: 'Casa',
    description: 'Etiqueta para identificar la dirección (Casa, Trabajo, etc.)',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  label?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si esta dirección es la predeterminada del usuario',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

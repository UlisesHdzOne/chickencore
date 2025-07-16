import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchedulingRuleDto {
  @ApiProperty({ description: 'Día de la semana (0=Domingo, 1=Lunes, etc.)', minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiPropertyOptional({ description: 'Si la regla está activa' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Monto mínimo requerido' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Cantidad mínima de pollos requerida' })
  @IsInt()
  @Min(0)
  @IsOptional()
  minChickenQuantity?: number;

  @ApiPropertyOptional({ description: 'Hora de inicio (formato HH:MM)' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime debe estar en formato HH:MM',
  })
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Hora de fin (formato HH:MM)' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime debe estar en formato HH:MM',
  })
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Descripción de la regla' })
  @IsString()
  @IsOptional()
  description?: string;
}
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, DeliveryType } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'Tipo de pedido', enum: OrderType })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({ description: 'Tipo de entrega', enum: DeliveryType })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiPropertyOptional({ description: 'Fecha y hora de entrega programada (solo para pedidos agendados)' })
  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @ApiPropertyOptional({ description: 'ID de la dirección de entrega' })
  @IsInt()
  @IsOptional()
  addressId?: number;

  @ApiPropertyOptional({ description: 'Notas del pedido' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Método de pago' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
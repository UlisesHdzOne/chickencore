import { IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CartItemForValidationDto {
  productId: number;
  quantity: number;
  productName: string;
  price: number;
}

export class ValidateSchedulingDto {
  @ApiProperty({ description: 'Fecha y hora del pedido agendado' })
  @IsDateString()
  scheduledFor: string;

  @ApiProperty({ description: 'Items del carrito para validar' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemForValidationDto)
  cartItems: CartItemForValidationDto[];
}
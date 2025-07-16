import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsDecimal,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductGiftDto {
  @ApiProperty({ description: 'ID del producto regalo' })
  @IsInt()
  giftId: number;

  @ApiProperty({ description: 'Cantidad del regalo', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Presentación del producto' })
  @IsString()
  presentation: string;

  @ApiPropertyOptional({ description: 'Descripción del producto' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Precio del producto' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Si el producto incluye regalos' })
  @IsBoolean()
  @IsOptional()
  hasGifts?: boolean;

  @ApiPropertyOptional({ description: 'ID de la categoría' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'URL de la imagen' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Cantidad en stock' })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Stock mínimo' })
  @IsInt()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @ApiPropertyOptional({ description: 'Regalos incluidos', type: [ProductGiftDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductGiftDto)
  @IsOptional()
  gifts?: ProductGiftDto[];
}
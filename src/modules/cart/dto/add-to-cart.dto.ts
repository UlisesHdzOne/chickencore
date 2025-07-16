import {
  IsInt,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SelectedGiftDto {
  @ApiProperty({ description: 'ID del producto regalo' })
  @IsInt()
  giftId: number;

  @ApiProperty({ description: 'Cantidad del regalo', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class AddToCartDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Cantidad del producto', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Regalos seleccionados', type: [SelectedGiftDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedGiftDto)
  @IsOptional()
  selectedGifts?: SelectedGiftDto[];
}
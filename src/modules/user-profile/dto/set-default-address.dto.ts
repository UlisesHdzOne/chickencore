import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetDefaultAddressDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la dirección a establecer como predeterminada',
  })
  @IsInt()
  @IsPositive()
  addressId: number;
}
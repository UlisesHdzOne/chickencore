import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateAddressDto } from '../../dto/update-address.dto';
import { SetDefaultAddressUseCase } from './set-default-address.usecase';

@Injectable()
export class UpdateAddressUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  async execute(
    userId: number,
    addressId: number,
    dto: UpdateAddressDto,
  ): Promise<any> {
    const existingAddress = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (dto.label && dto.label !== existingAddress.label) {
      const duplicateLabel = await this.prisma.address.findFirst({
        where: {
          userId,
          label: dto.label,
          id: { not: addressId },
        },
      });

      if (duplicateLabel) {
        throw new ConflictException(
          `Ya existe una dirección con la etiqueta "${dto.label}"`,
        );
      }
    }

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });

    if (updatedAddress.isDefault) {
      await this.setDefaultAddressUseCase.execute(userId, updatedAddress.id);
    }

    return {
      message: 'Dirección actualizada exitosamente',
      address: updatedAddress,
    };
  }
}

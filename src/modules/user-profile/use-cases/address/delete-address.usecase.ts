import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SetDefaultAddressUseCase } from './set-default-address.usecase';

@Injectable()
export class DeleteAddressUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  async execute(userId: number, addressId: number) {
    const existingAddress = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (existingAddress.isDefault) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddressId: null },
      });
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    if (existingAddress.isDefault) {
      const firstAddress = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (firstAddress) {
        await this.setDefaultAddressUseCase.execute(userId, firstAddress.id);
      }
    }

    return {
      message: 'Dirección eliminada exitosamente',
    };
  }
}

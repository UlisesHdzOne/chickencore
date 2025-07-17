import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SetDefaultAddressUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, addressId: number) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { defaultAddressId: addressId },
    });

    return {
      message: 'Dirección establecida como predeterminada',
      address: updated,
    };
  }
}

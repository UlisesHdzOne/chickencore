import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetUserAddressesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    return addresses;
  }
}

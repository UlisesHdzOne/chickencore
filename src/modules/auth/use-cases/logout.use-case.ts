import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number) {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('No hay sesión activa');
    }

    await this.prisma.refreshToken.delete({
      where: { userId },
    });

    return { message: 'Sesión cerrada correctamente' };
  }
}

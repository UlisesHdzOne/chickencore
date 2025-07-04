import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(token: string): Promise<{ message: string; verified: boolean }> {
    // Buscar el token de verificación
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException('Token de verificación inválido');
    }

    // Verificar si el token ha expirado
    if (verificationToken.expiresAt < new Date()) {
      // Eliminar token expirado
      await this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new BadRequestException('Token de verificación expirado');
    }

    // Verificar si el usuario ya está verificado
    if (verificationToken.user.emailVerified) {
      // Limpiar token ya que el email ya está verificado
      await this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      return {
        message: 'El email ya estaba verificado',
        verified: true,
      };
    }

    // Actualizar el usuario como verificado
    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Eliminar el token usado
    await this.prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Registrar evento de seguridad
    await this.prisma.securityLog.create({
      data: {
        userId: verificationToken.userId,
        eventType: 'EMAIL_VERIFICATION',
        details: 'Email verificado exitosamente',
        success: true,
      },
    });

    return {
      message: 'Email verificado correctamente',
      verified: true,
    };
  }
}
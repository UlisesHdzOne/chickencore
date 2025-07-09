import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { MailService } from '../services/mail.service';

@Injectable()
export class SendVerificationEmailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si ya está verificado
    if (user.emailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    // Limpiar tokens de verificación anteriores
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generar nuevo token
    const token = randomBytes(32).toString('hex');
    const expiresAt = addHours(new Date(), 24); // 24 horas

    // Guardar token en la base de datos
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Preparar email
    const subject = 'Verificación de Email - ChickenCore';
    const text = `
Hola ${user.name || 'Usuario'},

Para completar tu registro, verifica tu email haciendo clic en el siguiente enlace:
${process.env.FRONTEND_URL}/verify-email?token=${token}

Este enlace expirará en 24 horas.

Si no solicitaste esta verificación, puedes ignorar este email.
`;

    // Enviar email
    try {
      await this.mailService.sendMail(email, subject, text);
    } catch (error) {
      // Si falla el envío, eliminar el token
      await this.prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });
      throw new BadRequestException('Error al enviar el email de verificación');
    }

    return {
      message: 'Email de verificación enviado correctamente',
    };
  }
}

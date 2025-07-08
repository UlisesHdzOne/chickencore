import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MailService } from '../services/mail.service';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async execute(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (user) {
        const token = randomBytes(32).toString('hex');
        const expiresAt = addHours(new Date(), 1);

        await this.prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token,
            expiresAt,
          },
        });

        const resetLink = `https://tu-frontend.com/reset-password?token=${token}`;

        await this.mailService.sendMail(
          email,
          'Restablecimiento de contraseña',
          `Ingresa a este enlace para restablecer tu contraseña: ${resetLink}`,
        );
      }

      // Siempre responde lo mismo, exista o no el usuario
      return { message: 'Correo enviado si el usuario existe' };
    } catch (error) {
      console.error('Error en forgot-password:', error);
      throw error;
    }
  }
}

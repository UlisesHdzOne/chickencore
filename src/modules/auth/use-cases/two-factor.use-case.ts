import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async enableTwoFactor(userId: number, verificationCode: string): Promise<{
    message: string;
    backupCodes: string[];
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA ya está habilitado');
    }

    // Generar secret temporal si no existe
    let secret = user.twoFactorSecret;
    if (!secret) {
      const secretData = speakeasy.generateSecret({
        name: `ChickenCore (${user.email})`,
        issuer: 'ChickenCore',
      });
      secret = secretData.base32;

      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret },
      });
    }

    // Verificar el código
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: verificationCode,
      window: 2,
    });

    if (!verified) {
      throw new BadRequestException('Código de verificación inválido');
    }

    // Generar códigos de respaldo
    const backupCodes = this.generateBackupCodes();

    // Habilitar 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        // Aquí podrías guardar los códigos de respaldo hasheados
      },
    });

    // Registrar evento de seguridad
    await this.prisma.securityLog.create({
      data: {
        userId,
        eventType: 'TWO_FACTOR_ENABLED',
        details: '2FA habilitado exitosamente',
        success: true,
      },
    });

    return {
      message: '2FA habilitado correctamente',
      backupCodes,
    };
  }

  async disableTwoFactor(userId: number, verificationCode: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA no está habilitado');
    }

    // Verificar el código
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: verificationCode,
      window: 2,
    });

    if (!verified) {
      throw new BadRequestException('Código de verificación inválido');
    }

    // Deshabilitar 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Registrar evento de seguridad
    await this.prisma.securityLog.create({
      data: {
        userId,
        eventType: 'TWO_FACTOR_DISABLED',
        details: '2FA deshabilitado exitosamente',
        success: true,
      },
    });

    return { message: '2FA deshabilitado correctamente' };
  }

  async verifyTwoFactor(userId: number, code: string): Promise<{ verified: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA no está configurado');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    return { verified };
  }

  async generateQRCode(userId: number): Promise<{ qrCodeUrl: string; secret: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Generar secret si no existe
    let secret = user.twoFactorSecret;
    if (!secret) {
      const secretData = speakeasy.generateSecret({
        name: `ChickenCore (${user.email})`,
        issuer: 'ChickenCore',
      });
      secret = secretData.base32;

      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret },
      });
    }

    // Generar URL para el QR
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: `ChickenCore (${user.email})`,
      issuer: 'ChickenCore',
      encoding: 'base32',
    });

    // Generar QR code
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    return { qrCodeUrl, secret };
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
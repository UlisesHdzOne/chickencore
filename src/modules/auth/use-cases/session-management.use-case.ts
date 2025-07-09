import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SessionManagementUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getActiveSessions(userId: number): Promise<any[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      isCurrent: false, // Se actualizará en el controller
    }));
  }

  async logoutSpecificSession(
    userId: number,
    sessionId: string,
  ): Promise<{ message: string }> {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Sesión no encontrada');
    }

    // Desactivar la sesión
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    // Eliminar refresh tokens asociados a esta sesión
    await this.prisma.refreshToken.deleteMany({
      where: { sessionId },
    });

    // Registrar evento de seguridad
    await this.prisma.securityLog.create({
      data: {
        userId,
        eventType: 'SESSION_LOGOUT',
        details: `Sesión específica cerrada: ${sessionId}`,
        success: true,
      },
    });

    return { message: 'Sesión cerrada correctamente' };
  }

  async logoutAllDevices(
    userId: number,
  ): Promise<{ message: string; sessionsLoggedOut: number }> {
    // Contar sesiones activas
    const activeSessionsCount = await this.prisma.userSession.count({
      where: {
        userId,
        isActive: true,
      },
    });

    // Desactivar todas las sesiones del usuario
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: { isActive: false },
    });

    // Eliminar todos los refresh tokens del usuario
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Registrar evento de seguridad
    await this.prisma.securityLog.create({
      data: {
        userId,
        eventType: 'SESSION_LOGOUT',
        details: `Todas las sesiones cerradas (${activeSessionsCount} sesiones)`,
        success: true,
      },
    });

    return {
      message: 'Todas las sesiones han sido cerradas',
      sessionsLoggedOut: activeSessionsCount,
    };
  }

  async createSession(
    userId: number,
    deviceInfo: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<string> {
    const sessionId = await this.generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días

    await this.prisma.userSession.create({
      data: {
        id: sessionId,
        userId,
        deviceInfo,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return sessionId;
  }

  private async generateSessionId(): Promise<string> {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() },
    });
  }
}

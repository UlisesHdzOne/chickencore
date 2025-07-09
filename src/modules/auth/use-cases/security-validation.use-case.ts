import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

export interface PasswordStrength {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  suggestions: string[];
  meets: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

@Injectable()
export class SecurityValidationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async checkPasswordStrength(password: string): Promise<PasswordStrength> {
    const meets = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
    };

    const score = Object.values(meets).filter(Boolean).length;

    let strength: 'weak' | 'fair' | 'good' | 'strong';
    const suggestions: string[] = [];

    // Determinar fortaleza
    if (score <= 2) {
      strength = 'weak';
    } else if (score === 3) {
      strength = 'fair';
    } else if (score === 4) {
      strength = 'good';
    } else {
      strength = 'strong';
    }

    // Generar sugerencias
    if (!meets.length) {
      suggestions.push('Usa al menos 8 caracteres');
    }
    if (!meets.uppercase) {
      suggestions.push('Incluye al menos una letra mayúscula');
    }
    if (!meets.lowercase) {
      suggestions.push('Incluye al menos una letra minúscula');
    }
    if (!meets.numbers) {
      suggestions.push('Incluye al menos un número');
    }
    if (!meets.symbols) {
      suggestions.push('Incluye al menos un símbolo especial');
    }

    // Verificar patrones comunes débiles
    const commonPatterns = [/123456/, /password/i, /qwerty/i, /admin/i];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        suggestions.push('Evita usar patrones comunes o palabras obvias');
        if (strength !== 'weak') {
          strength = 'fair';
        }
        break;
      }
    }

    return {
      score,
      strength,
      suggestions,
      meets,
    };
  }

  async validateToken(token: string): Promise<{
    valid: boolean;
    decoded?: any;
    error?: string;
  }> {
    try {
      const decoded = this.jwtService.verify(token);

      // Verificar si el usuario existe y está activo
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        return {
          valid: false,
          error: 'Usuario no encontrado o inactivo',
        };
      }

      return {
        valid: true,
        decoded: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          iat: decoded.iat,
          exp: decoded.exp,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message || 'Token inválido',
      };
    }
  }

  async getSecurityLogs(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    logs: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.securityLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.securityLog.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        eventType: log.eventType,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        success: log.success,
        createdAt: log.createdAt,
      })),
      total,
      page,
      totalPages,
    };
  }

  async logSecurityEvent(
    userId: number,
    eventType: string,
    details: string,
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true,
  ): Promise<void> {
    await this.prisma.securityLog.create({
      data: {
        userId,
        eventType: eventType as any, // Cast temporal hasta que se regenere Prisma
        details,
        ipAddress,
        userAgent,
        success,
      },
    });
  }
}

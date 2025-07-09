import { SessionManagementUseCase } from './session-management.use-case';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { PrismaService } from 'src/modules/prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly sessionUseCase: SessionManagementUseCase,
  ) {}

  async execute(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 días

    await this.prisma.refreshToken.upsert({
      where: { userId: user.id },
      update: { token: refreshToken, expiresAt },
      create: { userId: user.id, token: refreshToken, expiresAt },
    });

    const sessionId = await this.sessionUseCase.createSession(
      user.id,
      loginDto.deviceInfo ?? '',
      loginDto.ipAddress ?? '',
      loginDto.userAgent ?? '',
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}

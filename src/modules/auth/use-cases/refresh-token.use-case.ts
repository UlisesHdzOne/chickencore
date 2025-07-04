import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || !stored.user) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    });

    return { access_token: accessToken };
  }
}

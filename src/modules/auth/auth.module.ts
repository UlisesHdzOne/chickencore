import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// Existing use cases
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
// New use cases
import { SendVerificationEmailUseCase } from './use-cases/send-verification-email.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { SessionManagementUseCase } from './use-cases/session-management.use-case';
import { TwoFactorUseCase } from './use-cases/two-factor.use-case';
import { SecurityValidationUseCase } from './use-cases/security-validation.use-case';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    PrismaService,
    JwtStrategy,
    AuthService,
    // Existing use cases
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    // New use cases
    SendVerificationEmailUseCase,
    VerifyEmailUseCase,
    SessionManagementUseCase,
    TwoFactorUseCase,
    SecurityValidationUseCase,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

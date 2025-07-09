import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { LoginUseCase } from './use-cases/login.use-case';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from './use-cases/register.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { MailService } from './services/mail.service';
import { SecurityValidationUseCase } from './use-cases/security-validation.use-case';
import { SendVerificationEmailUseCase } from './use-cases/send-verification-email.use-case';
import { SessionManagementUseCase } from './use-cases/session-management.use-case';

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
    MailService,
    PrismaService,
    JwtStrategy,
    LoginUseCase,
    AuthService,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    SecurityValidationUseCase,
    SendVerificationEmailUseCase,
    SessionManagementUseCase,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

import { SendVerificationEmailUseCase } from './use-cases/send-verification-email.use-case';
import { Injectable } from '@nestjs/common';
import { LoginUseCase } from './use-cases/login.use-case';
import { LoginDto } from './dto/login.dto';
import { RegisterUseCase } from './use-cases/register.use-case';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { SecurityValidationUseCase } from './use-cases/security-validation.use-case';
import { SessionManagementUseCase } from './use-cases/session-management.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly securityValidationUseCase: SecurityValidationUseCase,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly sessionUseCase: SessionManagementUseCase,
  ) {}

  async login(loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  async register(registerDto: RegisterDto) {
    return this.registerUseCase.execute(registerDto);
  }

  async refreshToken(token: string) {
    return this.refreshTokenUseCase.execute(token);
  }

  async logout(userId: number) {
    return this.logoutUseCase.execute(userId);
  }

  async forgotPassword(email: string) {
    return this.forgotPasswordUseCase.execute(email);
  }

  async checkPasswordStrength(password: string) {
    return this.securityValidationUseCase.checkPasswordStrength(password);
  }

  async sendVerificationEmail(email: string) {
    return this.sendVerificationEmailUseCase.execute(email);
  }

  async getActiveSessions(userId: number) {
    return this.sessionUseCase.getActiveSessions(userId);
  }

  async logoutSpecificSession(userId: number, sessionId: string) {
    return this.sessionUseCase.logoutSpecificSession(userId, sessionId);
  }

  async logoutAllDevices(userId: number) {
    return this.sessionUseCase.logoutAllDevices(userId);
  }
}

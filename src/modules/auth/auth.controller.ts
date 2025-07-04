import { Body, Controller, Post, Get, Delete, UnauthorizedException, Param, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
// Nuevos DTOs
import { VerifyEmailDto, SendVerificationEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
import { EnableTwoFactorDto, VerifyTwoFactorDto, DisableTwoFactorDto } from './dto/two-factor.dto';
import { CheckPasswordStrengthDto, ValidateTokenDto, GetSecurityLogsDto } from './dto/security.dto';
// Nuevos Use Cases
import { SendVerificationEmailUseCase } from './use-cases/send-verification-email.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { SessionManagementUseCase } from './use-cases/session-management.use-case';
import { TwoFactorUseCase } from './use-cases/two-factor.use-case';
import { SecurityValidationUseCase } from './use-cases/security-validation.use-case';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly sessionManagementUseCase: SessionManagementUseCase,
    private readonly twoFactorUseCase: TwoFactorUseCase,
    private readonly securityValidationUseCase: SecurityValidationUseCase,
  ) {}

  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 201, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    if (!result) throw new UnauthorizedException('Credenciales inválidas');
    return result;
  }

  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 409, description: 'Correo ya en uso' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error.status === 409) throw error;
      throw error;
    }
  }

  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ status: 200, description: 'Nuevo access token generado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  @Post('refresh-token')
  async refresh(@Query('token') token: string) {
    if (!token) throw new UnauthorizedException('Refresh token requerido');
    return this.authService.refreshToken(token);
  }

  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  @ApiResponse({ status: 404, description: 'No hay sesión activa' })
  @ApiBearerAuth('access-token') // <== importante
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    return this.authService.logout(req.user.userId);
  }

  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Correo enviado si existe el usuario',
  })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // ============ VERIFICACIÓN DE EMAIL ============
  @ApiOperation({ summary: 'Enviar email de verificación' })
  @ApiResponse({ status: 200, description: 'Email enviado correctamente' })
  @Post('send-verification-email')
  async sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
    return this.sendVerificationEmailUseCase.execute(dto.email);
  }

  @ApiOperation({ summary: 'Verificar email con token' })
  @ApiResponse({ status: 200, description: 'Email verificado correctamente' })
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.verifyEmailUseCase.execute(dto.token);
  }

  @ApiOperation({ summary: 'Reenviar email de verificación' })
  @ApiResponse({ status: 200, description: 'Email reenviado correctamente' })
  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.sendVerificationEmailUseCase.execute(dto.email);
  }

  // ============ GESTIÓN DE SESIONES ============
  @ApiOperation({ summary: 'Ver sesiones activas' })
  @ApiResponse({ status: 200, description: 'Lista de sesiones activas' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('active-sessions')
  async getActiveSessions(@Req() req) {
    return this.sessionManagementUseCase.getActiveSessions(req.user.userId);
  }

  @ApiOperation({ summary: 'Cerrar sesión específica' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete('session/:sessionId')
  async logoutSpecificSession(@Req() req, @Param('sessionId') sessionId: string) {
    return this.sessionManagementUseCase.logoutSpecificSession(req.user.userId, sessionId);
  }

  @ApiOperation({ summary: 'Cerrar todas las sesiones' })
  @ApiResponse({ status: 200, description: 'Todas las sesiones cerradas' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout-all-devices')
  async logoutAllDevices(@Req() req) {
    return this.sessionManagementUseCase.logoutAllDevices(req.user.userId);
  }

  // ============ AUTENTICACIÓN DE DOS FACTORES ============
  @ApiOperation({ summary: 'Generar QR para configurar 2FA' })
  @ApiResponse({ status: 200, description: 'QR generado correctamente' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('2fa/qr-code')
  async generate2FAQRCode(@Req() req) {
    return this.twoFactorUseCase.generateQRCode(req.user.userId);
  }

  @ApiOperation({ summary: 'Habilitar autenticación de dos factores' })
  @ApiResponse({ status: 200, description: '2FA habilitado correctamente' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('enable-2fa')
  async enableTwoFactor(@Req() req, @Body() dto: EnableTwoFactorDto) {
    return this.twoFactorUseCase.enableTwoFactor(req.user.userId, dto.verificationCode);
  }

  @ApiOperation({ summary: 'Verificar código 2FA' })
  @ApiResponse({ status: 200, description: 'Código verificado' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('verify-2fa')
  async verifyTwoFactor(@Req() req, @Body() dto: VerifyTwoFactorDto) {
    return this.twoFactorUseCase.verifyTwoFactor(req.user.userId, dto.code);
  }

  @ApiOperation({ summary: 'Deshabilitar autenticación de dos factores' })
  @ApiResponse({ status: 200, description: '2FA deshabilitado correctamente' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('disable-2fa')
  async disableTwoFactor(@Req() req, @Body() dto: DisableTwoFactorDto) {
    return this.twoFactorUseCase.disableTwoFactor(req.user.userId, dto.verificationCode);
  }

  // ============ VALIDACIONES DE SEGURIDAD ============
  @ApiOperation({ summary: 'Verificar fortaleza de contraseña' })
  @ApiResponse({ status: 200, description: 'Análisis de fortaleza completado' })
  @Post('check-password-strength')
  async checkPasswordStrength(@Body() dto: CheckPasswordStrengthDto) {
    return this.securityValidationUseCase.checkPasswordStrength(dto.password);
  }

  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({ status: 200, description: 'Token validado' })
  @Post('validate-token')
  async validateToken(@Body() dto: ValidateTokenDto) {
    return this.securityValidationUseCase.validateToken(dto.token);
  }

  @ApiOperation({ summary: 'Obtener logs de seguridad del usuario' })
  @ApiResponse({ status: 200, description: 'Logs de seguridad obtenidos' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('security-logs')
  async getSecurityLogs(@Req() req, @Query() query: GetSecurityLogsDto) {
    return this.securityValidationUseCase.getSecurityLogs(
      req.user.userId,
      query.page,
      query.limit,
    );
  }
}

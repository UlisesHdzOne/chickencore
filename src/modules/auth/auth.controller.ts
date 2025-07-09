import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { Query } from '@nestjs/common';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckPasswordStrengthDto } from './dto/check-password-strength.dto';
import { SendVerificationEmailDto } from './dto/send-verification-email.dto';
import { LogoutSessionDto } from './dto/logout-session.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @ApiOperation({ summary: 'Verificar fortaleza de contraseña' })
  @ApiBody({ type: CheckPasswordStrengthDto })
  @Post('check-password-strength')
  async checkPasswordStrength(@Body() dto: CheckPasswordStrengthDto) {
    return this.authService.checkPasswordStrength(dto.password);
  }

  @ApiOperation({ summary: 'Enviar email de verificación' })
  @ApiResponse({ status: 200, description: 'Email de verificación enviado' })
  @ApiBody({ type: SendVerificationEmailDto })
  @Post('send-verification-email')
  async sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
    return this.authService.sendVerificationEmail(dto.email);
  }

  @ApiOperation({ summary: 'Obtener sesiones activas' })
  @ApiResponse({ status: 200, description: 'Lista de sesiones activas' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token') // <== importante
  @Get('sessions') // Cambiado de @Post a @Get
  async getSessions(@Req() req) {
    const sessions = await this.authService.getActiveSessions(req.user.userId);
    // Marcar sesión actual
    const updated = sessions.map((s) => ({
      ...s,
      isCurrent: s.id === req.user.sessionId,
    }));
    return updated;
  }

  @ApiOperation({ summary: 'Cerrar sesión específica' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  @ApiBody({ type: LogoutSessionDto })
  @ApiBearerAuth('access-token') // <== importante
  @UseGuards(JwtAuthGuard)
  @Post('sessions/logout')
  async logoutSession(@Req() req, @Body() dto: LogoutSessionDto) {
    return this.authService.logoutSpecificSession(
      req.user.userId,
      dto.sessionId,
    );
  }

  @ApiOperation({ summary: 'Cerrar todas las sesiones' })
  @ApiResponse({ status: 200, description: 'Todas las sesiones cerradas' })
  @ApiBearerAuth('access-token') // <== importante
  @UseGuards(JwtAuthGuard)
  @Post('sessions/logout-all')
  async logoutAll(@Req() req) {
    return this.authService.logoutAllDevices(req.user.userId);
  }
}

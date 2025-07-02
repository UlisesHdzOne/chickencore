import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { Query } from '@nestjs/common';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
}

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User Profile')
@Controller('user-profile')
@ApiBearerAuth('access-token')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @ApiOperation({ summary: 'Obtener perfil completo del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Req() req) {
    return this.userProfileService.getUserProfile(req.user.userId);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

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

  // === ENDPOINTS DE DIRECCIONES ===

  @ApiOperation({ summary: 'Obtener todas las direcciones del usuario' })
  @ApiResponse({
    status: 200,

    description: 'Lista de direcciones obtenida exitosamente',
  })
  @UseGuards(JwtAuthGuard)
  @Get('addresses')
  async getAddresses(@Req() req) {
    return this.userProfileService.getUserAddresses(req.user.userId);
  }

  @ApiOperation({ summary: 'Crear nueva dirección' })
  @ApiResponse({
    status: 201,

    description: 'Dirección creada exitosamente',
  })
  @ApiResponse({
    status: 409,

    description: 'Ya existe una dirección con esa etiqueta',
  })
  @UseGuards(JwtAuthGuard)
  @Post('addresses')
  async createAddress(@Req() req, @Body() createAddressDto: CreateAddressDto) {
    return this.userProfileService.createAddress(
      req.user.userId,

      createAddressDto,
    );
  }

  @ApiOperation({ summary: 'Actualizar dirección existente' })
  @ApiParam({
    name: 'addressId',

    description: 'ID de la dirección a actualizar',

    type: 'number',
  })
  @ApiResponse({
    status: 200,

    description: 'Dirección actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,

    description: 'Dirección no encontrada',
  })
  @UseGuards(JwtAuthGuard)
  @Put('addresses/:addressId')
  async updateAddress(
    @Req() req,

    @Param('addressId', ParseIntPipe) addressId: number,

    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.userProfileService.updateAddress(
      req.user.userId,

      addressId,

      updateAddressDto,
    );
  }

  @ApiOperation({ summary: 'Eliminar dirección' })
  @ApiParam({
    name: 'addressId',

    description: 'ID de la dirección a eliminar',

    type: 'number',
  })
  @ApiResponse({
    status: 200,

    description: 'Dirección eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,

    description: 'Dirección no encontrada',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('addresses/:addressId')
  async deleteAddress(
    @Req() req,

    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.userProfileService.deleteAddress(req.user.userId, addressId);
  }

  @ApiOperation({ summary: 'Establecer dirección como predeterminada' })
  @ApiParam({
    name: 'addressId',

    description: 'ID de la dirección a establecer como predeterminada',

    type: 'number',
  })
  @ApiResponse({
    status: 200,

    description: 'Dirección establecida como predeterminada',
  })
  @ApiResponse({
    status: 404,

    description: 'Dirección no encontrada',
  })
  @UseGuards(JwtAuthGuard)
  @Post('addresses/:addressId/set-default')
  async setDefaultAddress(
    @Req() req,

    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.userProfileService.setDefaultAddress(
      req.user.userId,

      addressId,
    );
  }
}

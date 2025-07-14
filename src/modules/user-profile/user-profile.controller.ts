import { Multer } from 'multer';
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadProfilePictureDto } from './dto/upload-profile-picture.dto';
import { NearbyCoordinatesDto } from './dto/nearby-coordinates.dto';

@ApiTags('User Profile')
@Controller('user-profile')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
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
  @Get()
  async getProfile(@Req() req) {
    return this.userProfileService.getUserProfile(req.user.userId);
  }

  @ApiOperation({ summary: 'Actualizar información básica del perfil' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @Put()
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userProfileService.updateProfile(
      req.user.userId,
      updateProfileDto,
    );
  }

  @ApiOperation({ summary: 'Subir foto de perfil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadProfilePictureDto })
  @ApiResponse({
    status: 200,
    description: 'Foto de perfil actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o muy grande',
  })
  @Post('picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(@Req() req, @UploadedFile() file: Multer.File) {
    return this.userProfileService.uploadProfilePicture(req.user.userId, file);
  }
  // === ENDPOINTS DE DIRECCIONES ===

  @ApiOperation({ summary: 'Obtener todas las direcciones del usuario' })
  @ApiResponse({
    status: 200,

    description: 'Lista de direcciones obtenida exitosamente',
  })
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

  @ApiOperation({ summary: 'Validar dirección antes de guardar' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de validación de dirección',
  })
  @Post('addresses/validate')
  async validateAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.userProfileService.validateAddress(createAddressDto);
  }

  @ApiOperation({ summary: 'Geocodificar dirección específica' })
  @ApiResponse({
    status: 200,
    description: 'Dirección geocodificada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Dirección no encontrada',
  })
  @Post('addresses/:addressId/geocode')
  async geocodeAddress(
    @Req() req,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.userProfileService.geocodeAddress(req.user.userId, addressId);
  }

  @ApiOperation({ summary: 'Geocodificar todas las direcciones del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Proceso de geocodificación completado',
  })
  @Post('addresses/geocode-all')
  async geocodeAllAddresses(@Req() req) {
    return this.userProfileService.geocodeAllAddresses(req.user.userId);
  }

  @ApiOperation({ summary: 'Obtener direcciones cercanas a una ubicación' })
  @ApiResponse({
    status: 200,
    description: 'Direcciones cercanas obtenidas exitosamente',
  })
  @Post('addresses/nearby')
  async getNearbyAddresses(@Req() req, @Body() dto: NearbyCoordinatesDto) {
    return this.userProfileService.getNearbyAddressesFromString(
      req.user.userId,
      dto.coordinates,
    );
  }
}

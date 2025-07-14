import { Multer } from 'multer';
import {
  BadRequestException,
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
import {
  NearbyServicesByAddressDto,
  NearbyServicesByCoordinatesDto,
  NearbyServicesDto,
} from './dto/nearby-services.dto';

@ApiTags('User Profile')
@Controller('user-profile')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @ApiOperation({ summary: 'Obtener perfil completo del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get()
  async getProfile(@Req() req) {
    return this.userProfileService.getUserProfile(req.user.userId);
  }

  @ApiOperation({ summary: 'Actualizar información básica del perfil' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
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
  @ApiResponse({ status: 400, description: 'Archivo inválido o muy grande' })
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
  @ApiResponse({ status: 201, description: 'Dirección creada exitosamente' })
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
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
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
  @ApiResponse({ status: 200, description: 'Dirección eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
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
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
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
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
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

  // === NUEVOS ENDPOINTS DE SERVICIOS CERCANOS ===

  @ApiOperation({
    summary: 'Obtener servicios y direcciones cercanas con opciones avanzadas',
    description:
      'Busca servicios externos y direcciones del usuario cerca de coordenadas específicas',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios cercanos obtenidos exitosamente',
    schema: {
      example: {
        addresses: [
          {
            id: 1,
            label: 'Casa',
            street: 'Av. Insurgentes 123',
            city: 'CDMX',
            distance: 0.5,
          },
        ],
        services: [],
        totalFound: 1,
        searchRadius: 5,
        center: {
          latitude: 19.4326,
          longitude: -99.1332,
        },
      },
    },
  })
  @Post('services/nearby')
  async getNearbyServices(@Req() req, @Body() dto: NearbyServicesDto) {
    const coordinates = this.parseCoordinates(dto.coordinates);

    return this.userProfileService.getNearbyServices(
      req.user.userId,
      coordinates,
      {
        radius: dto.radius,
        serviceTypes: dto.serviceTypes,
        includeAddresses: dto.includeAddresses,
        limit: dto.limit,
      },
    );
  }

  @ApiOperation({
    summary: 'Obtener servicios cercanos desde una dirección específica',
    description:
      'Busca servicios y direcciones cercanas usando una dirección existente como punto de referencia',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios cercanos obtenidos exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  @Post('addresses/:addressId/nearby-services')
  async getNearbyServicesByAddress(
    @Req() req,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() dto: NearbyServicesByAddressDto,
  ) {
    return this.userProfileService.getNearbyServicesFromAddress(
      req.user.userId,
      addressId,
      {
        radius: dto.radius,
        serviceTypes: dto.serviceTypes,
        includeAddresses: dto.includeAddresses,
        limit: dto.limit,
      },
    );
  }

  @ApiOperation({
    summary: 'Obtener servicios cercanos con coordenadas exactas',
    description:
      'Busca servicios y direcciones cercanas usando coordenadas precisas',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios cercanos obtenidos exitosamente',
  })
  @Post('services/nearby-exact')
  async getNearbyServicesByCoordinates(
    @Req() req,
    @Body() dto: NearbyServicesByCoordinatesDto,
  ) {
    return this.userProfileService.getNearbyServices(
      req.user.userId,
      dto.coordinates,
      {
        radius: dto.radius,
        serviceTypes: dto.serviceTypes,
        includeAddresses: dto.includeAddresses,
        limit: dto.limit,
      },
    );
  }

  // Método helper para parsear coordenadas
  private parseCoordinates(coordinatesString: string): {
    latitude: number;
    longitude: number;
  } {
    try {
      let lat: number, lng: number;

      if (coordinatesString.includes(',')) {
        const [latStr, lngStr] = coordinatesString.split(',');
        lat = parseFloat(latStr.trim());
        lng = parseFloat(lngStr.trim());
      } else if (coordinatesString.includes(' ')) {
        const [latStr, lngStr] = coordinatesString.split(' ');
        lat = parseFloat(latStr.trim());
        lng = parseFloat(lngStr.trim());
      } else {
        throw new Error('Formato inválido');
      }

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Coordenadas inválidas');
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Coordenadas fuera de rango');
      }

      return { latitude: lat, longitude: lng };
    } catch (error) {
      throw new BadRequestException(
        'Formato de coordenadas inválido. Usa "lat,lng" o "lat lng"',
      );
    }
  }
}

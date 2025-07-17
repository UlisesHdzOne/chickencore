import { GetNearbyServicesUseCase } from './use-cases/location/get-nearby-services.use-case';
import { Multer } from 'multer';
import { Injectable } from '@nestjs/common';
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateProfileUseCase } from './use-cases/basic/update-profile.use-case';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadProfilePictureUseCase } from './use-cases/media/upload-profile-picture.use-case';
import { ValidateAddressUseCase } from './use-cases/address/validate-address.use-case';
import { GeocodeAddressUseCase } from './use-cases/address/geocode-address.use-case';
import { GetUserAddressesUseCase } from './use-cases/address/get-user-addresses.usecase';
import { CreateAddressUseCase } from './use-cases/address/create-address.usecase';
import { UpdateAddressUseCase } from './use-cases/address/update-address.usecase';
import { DeleteAddressUseCase } from './use-cases/address/delete-address.usecase';
import { SetDefaultAddressUseCase } from './use-cases/address/set-default-address.usecase';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly getUserAddressesUseCase: GetUserAddressesUseCase,
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadProfilePictureUseCase: UploadProfilePictureUseCase,
    private readonly validateAddressUseCase: ValidateAddressUseCase,
    private readonly geocodeAddressUseCase: GeocodeAddressUseCase,
    private readonly getNearbyServicesUseCase: GetNearbyServicesUseCase,
  ) {}

  async getUserProfile(userId: number) {
    return this.getUserProfileUseCase.execute(userId);
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    return this.updateProfileUseCase.execute(userId, updateProfileDto);
  }

  async uploadProfilePicture(userId: number, file: Multer.File) {
    return this.uploadProfilePictureUseCase.execute(userId, file);
  }

  // Métodos de direcciones
  async getUserAddresses(userId: number) {
    return this.getUserAddressesUseCase.execute(userId);
  }
  async createAddress(userId: number, createAddressDto: CreateAddressDto) {
    return this.createAddressUseCase.execute(userId, createAddressDto);
  }

  async updateAddress(
    userId: number,
    addressId: number,
    updateAddressDto: UpdateAddressDto,
  ) {
    return this.updateAddressUseCase.execute(
      userId,
      addressId,
      updateAddressDto,
    );
  }

  async deleteAddress(userId: number, addressId: number) {
    return this.deleteAddressUseCase.execute(userId, addressId);
  }

  async setDefaultAddress(userId: number, addressId: number) {
    return this.setDefaultAddressUseCase.execute(userId, addressId);
  }

  async validateAddress(addressData: CreateAddressDto) {
    return this.validateAddressUseCase.execute(addressData);
  }

  async geocodeAddress(userId: number, addressId: number) {
    return this.geocodeAddressUseCase.execute(userId, addressId);
  }

  async geocodeAllAddresses(userId: number) {
    return this.geocodeAddressUseCase.geocodeBatch(userId);
  }

  async getNearbyAddresses(
    userId: number,
    latitude: number,
    longitude: number,
    radiusKm?: number,
  ) {
    return this.geocodeAddressUseCase.getNearbyAddresses(
      userId,
      latitude,
      longitude,
      radiusKm,
    );
  }

  async getNearbyAddressesFromString(userId: number, coordinates: string) {
    return this.getNearbyServicesUseCase.executeFromCoordinatesString(
      userId,
      coordinates,
      { includeAddresses: true, radius: 5 },
    );
  }

  // Nuevo método para servicios cercanos con más opciones

  async getNearbyServices(
    userId: number,
    coordinates: { latitude: number; longitude: number },
    options: {
      radius?: number;
      serviceTypes?: string[];
      includeAddresses?: boolean;
      limit?: number;
    } = {},
  ) {
    return this.getNearbyServicesUseCase.execute(userId, coordinates, options);
  }

  async getNearbyServicesFromAddress(
    userId: number,
    addressId: number,
    options: {
      radius?: number;
      serviceTypes?: string[];
      includeAddresses?: boolean;
      limit?: number;
    } = {},
  ) {
    return this.getNearbyServicesUseCase.executeFromAddress(
      userId,
      addressId,
      options,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/basic/update-profile.use-case';
import { UploadProfilePictureUseCase } from './use-cases/basic/upload-profile-picture.use-case';
import { ManageAddressesUseCase } from './use-cases/basic/manage-addresses.use-case';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadProfilePictureUseCase: UploadProfilePictureUseCase,
    private readonly manageAddressesUseCase: ManageAddressesUseCase,
  ) {}

  // Métodos de perfil de usuario
  async getUserProfile(userId: number) {
    return this.getUserProfileUseCase.execute(userId);
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    return this.updateProfileUseCase.execute(userId, updateProfileDto);
  }

  async uploadProfilePicture(userId: number, file: Express.Multer.File) {
    return this.uploadProfilePictureUseCase.execute(userId, file);
  }

  // Métodos de direcciones
  async getUserAddresses(userId: number) {
    return this.manageAddressesUseCase.getUserAddresses(userId);
  }

  async createAddress(userId: number, createAddressDto: CreateAddressDto) {
    return this.manageAddressesUseCase.createAddress(userId, createAddressDto);
  }

  async updateAddress(
    userId: number,
    addressId: number,
    updateAddressDto: UpdateAddressDto,
  ) {
    return this.manageAddressesUseCase.updateAddress(
      userId,
      addressId,
      updateAddressDto,
    );
  }

  async deleteAddress(userId: number, addressId: number) {
    return this.manageAddressesUseCase.deleteAddress(userId, addressId);
  }

  async setDefaultAddress(userId: number, addressId: number) {
    return this.manageAddressesUseCase.setDefaultAddress(userId, addressId);
  }
}
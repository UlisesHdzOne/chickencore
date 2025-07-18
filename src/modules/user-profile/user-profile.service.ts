import { Multer } from 'multer';
import { Injectable } from '@nestjs/common';
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateProfileUseCase } from './use-cases/basic/update-profile.use-case';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadProfilePictureUseCase } from './use-cases/media/upload-profile-picture.use-case';
import { ValidateAddressUseCase } from './use-cases/address/validate-address.use-case';
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


}

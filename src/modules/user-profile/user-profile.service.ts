import { ManageAddressesUseCase } from './use-cases/basic/manage-addresses.use-case';
import { Injectable } from '@nestjs/common';
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly manageAddressesUseCase: ManageAddressesUseCase,
  ) {}

  async getUserProfile(userId: number) {
    return this.getUserProfileUseCase.execute(userId);
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

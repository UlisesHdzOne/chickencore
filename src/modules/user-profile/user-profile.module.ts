import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { UpdateProfileUseCase } from './use-cases/basic/update-profile.use-case';
import { UploadProfilePictureUseCase } from './use-cases/media/upload-profile-picture.use-case';
import { ValidateAddressUseCase } from './use-cases/address/validate-address.use-case';
import { GeocodeAddressUseCase } from './use-cases/address/geocode-address.use-case';
import { GeocodingProvidersService } from './services/geocoding-providers.service';
import { GetNearbyServicesUseCase } from './use-cases/location/get-nearby-services.use-case';
import { GetUserAddressesUseCase } from './use-cases/address/get-user-addresses.usecase';
import { CreateAddressUseCase } from './use-cases/address/create-address.usecase';
import { UpdateAddressUseCase } from './use-cases/address/update-address.usecase';
import { DeleteAddressUseCase } from './use-cases/address/delete-address.usecase';
import { SetDefaultAddressUseCase } from './use-cases/address/set-default-address.usecase';

@Module({
  imports: [PrismaModule],

  controllers: [UserProfileController],

  providers: [
    UserProfileService,
    GeocodingProvidersService,
    GetUserProfileUseCase,
    UpdateProfileUseCase,
    UploadProfilePictureUseCase,
    //casos de usos para address
    GetUserAddressesUseCase,
    CreateAddressUseCase,
    UpdateAddressUseCase,
    DeleteAddressUseCase,
    SetDefaultAddressUseCase,

    ValidateAddressUseCase,
    GeocodeAddressUseCase,
    GetNearbyServicesUseCase,
  ],

  exports: [
    GeocodingProvidersService,
    ValidateAddressUseCase,
    GeocodeAddressUseCase,
    GetNearbyServicesUseCase,
  ],
})
export class UserProfileModule {}

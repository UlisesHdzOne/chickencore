import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { ManageAddressesUseCase } from './use-cases/basic/manage-addresses.use-case';

@Module({
  imports: [PrismaModule],

  controllers: [UserProfileController],

  providers: [
    UserProfileService,
    GetUserProfileUseCase,
    ManageAddressesUseCase,
  ],

  exports: [],
})
export class UserProfileModule {}

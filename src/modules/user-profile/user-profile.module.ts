import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Controllers
import { UserProfileController } from './controllers/user-profile.controller';

// Services
import { UserProfileService } from './user-profile.service';

// Use Cases
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/basic/update-profile.use-case';
import { UploadProfilePictureUseCase } from './use-cases/basic/upload-profile-picture.use-case';
import { ManageAddressesUseCase } from './use-cases/basic/manage-addresses.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [UserProfileController],
  providers: [
    // Main Service
    UserProfileService,

    // Use Cases
    GetUserProfileUseCase,
    UpdateProfileUseCase,
    UploadProfilePictureUseCase,
    ManageAddressesUseCase,
  ],
  exports: [
    UserProfileService,
    GetUserProfileUseCase,
    UpdateProfileUseCase,
    UploadProfilePictureUseCase,
    ManageAddressesUseCase,
  ],
})
export class UserProfileModule {}
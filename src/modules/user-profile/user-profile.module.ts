import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  controllers: [UserProfileController],

  providers: [UserProfileService, GetUserProfileUseCase],

  exports: [],
})
export class UserProfileModule {}

import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [],

  controllers: [],

  providers: [UserProfileService],

  exports: [],
})
export class UserProfileModule {}

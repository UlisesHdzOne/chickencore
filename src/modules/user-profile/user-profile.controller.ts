import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';

@ApiTags('User Profile')
@Controller('user-profile')
@ApiBearerAuth('access-token')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}
}

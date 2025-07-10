import { Injectable } from '@nestjs/common';
import { GetUserProfileUseCase } from './use-cases/basic/get-user-profile.use-case';

@Injectable()
export class UserProfileService {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

  async getUserProfile(userId: number) {
    return this.getUserProfileUseCase.execute(userId);
  }
}

import { Injectable } from '@nestjs/common';
import { LoginUseCase } from './use-cases/login.use-case';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async login(loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }
}

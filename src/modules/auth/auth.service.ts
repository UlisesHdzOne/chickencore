import { Injectable } from '@nestjs/common';
import { LoginUseCase } from './use-cases/login.use-case';
import { LoginDto } from './dto/login.dto';
import { RegisterUseCase } from './use-cases/register.use-case';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async login(loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  async register(registerDto: RegisterDto) {
    return this.registerUseCase.execute(registerDto);
  }

  async refreshToken(token: string) {
    return this.refreshTokenUseCase.execute(token);
  }
}

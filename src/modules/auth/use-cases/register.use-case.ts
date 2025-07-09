import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { SecurityValidationUseCase } from './security-validation.use-case';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityValidation: SecurityValidationUseCase,
  ) {}

  async execute(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('El correo ya está en uso');

    const result = await this.securityValidation.checkPasswordStrength(dto.password);
    if (result.strength === 'weak' || result.strength === 'fair') {
      throw new BadRequestException(
        `Contraseña débil: ${result.suggestions.join(', ')}`,
      );
    }


    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'USER', // o el rol que quieras por defecto
      },
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}

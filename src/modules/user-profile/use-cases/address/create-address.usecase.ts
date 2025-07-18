import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAddressDto } from '../../dto/create-address.dto';
import { ValidateAddressUseCase } from './validate-address.use-case';
import { SetDefaultAddressUseCase } from './set-default-address.usecase';
@Injectable()
export class CreateAddressUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validateAddressUseCase: ValidateAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  async execute(userId: number, dto: CreateAddressDto): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    let addressToSave = { ...dto };
    let validationWarnings: string[] = [];

    try {
      const validationResult = await this.validateAddressUseCase.execute(dto);

      if (!validationResult.isValid && validationResult.confidence < 0.5) {
        throw new BadRequestException({
          message: 'Dirección inválida',
          errors: validationResult.errors,
          suggestions: validationResult.suggestions,
        });
      }

      if (
        validationResult.standardizedAddress &&
        validationResult.confidence > 0.7
      ) {
        addressToSave = {
          ...addressToSave,
          street: validationResult.standardizedAddress.street || dto.street,
          city: validationResult.standardizedAddress.city || dto.city,
          state: validationResult.standardizedAddress.state || dto.state,
          postalCode:
            validationResult.standardizedAddress.postalCode || dto.postalCode,
          country: validationResult.standardizedAddress.country || dto.country,
        };
      }

      if (validationResult.confidence < 0.7 && validationResult.suggestions) {
        validationWarnings = validationResult.suggestions;
      }
    } catch (error) {
      if (validationWarnings.length === 0) {
        validationWarnings = [
          'No se pudo validar la dirección con servicios externos',
        ];
      }
    }

    const existingAddress = await this.prisma.address.findFirst({
      where: {
        userId,
        label: addressToSave.label,
      },
    });

    if (existingAddress) {
      throw new ConflictException(
        `Ya existe una dirección con la etiqueta "${addressToSave.label}"`,
      );
    }

    const addressCount = await this.prisma.address.count({
      where: { userId },
    });

    const newAddress = await this.prisma.address.create({
      data: {
        userId,
        label: addressToSave.label,
        street: addressToSave.street,
        city: addressToSave.city,
        state: addressToSave.state,
        postalCode: addressToSave.postalCode,
        country: addressToSave.country || 'Mexico',
        isDefault: addressToSave.isDefault || addressCount === 0,
      },
    });

    if (newAddress.isDefault) {
      await this.setDefaultAddressUseCase.execute(userId, newAddress.id);
    }

    const result: any = {
      message: 'Dirección creada exitosamente',
      address: newAddress,
    };

    if (validationWarnings.length > 0) {
      result.warnings = validationWarnings;
      result.message += ' (con advertencias de validación)';
    }

    return result;
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAddressDto } from '../../dto/create-address.dto';
import { UpdateAddressDto } from '../../dto/update-address.dto';


@Injectable()
export class ManageAddressesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  // Obtener todas las direcciones del usuario
  async getUserAddresses(userId: number) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    return addresses;
  }

  // Crear nueva dirección
  async createAddress(userId: number, createAddressDto: CreateAddressDto) {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que no existe una dirección con el mismo label
    const existingAddress = await this.prisma.address.findFirst({
      where: {
        userId,
        label: createAddressDto.label,
      },
    });

    if (existingAddress) {
      throw new ConflictException(
        `Ya existe una dirección con la etiqueta "${createAddressDto.label}"`,
      );
    }

    // Si es la primera dirección o se marca como default, actualizar otras direcciones
    if (createAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Verificar si es la primera dirección del usuario
    const addressCount = await this.prisma.address.count({
      where: { userId },
    });

    const newAddress = await this.prisma.address.create({
      data: {
        userId,
        label: createAddressDto.label,
        street: createAddressDto.street,
        city: createAddressDto.city,
        state: createAddressDto.state,
        postalCode: createAddressDto.postalCode,
        country: createAddressDto.country || 'Mexico',
        isDefault: createAddressDto.isDefault || addressCount === 0, // Primera dirección es default automáticamente
      },
    });

    // Si esta dirección es default, actualizar la referencia en User
    if (newAddress.isDefault) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddressId: newAddress.id },
      });
    }

    return {
      message: 'Dirección creada exitosamente',
      address: newAddress,
    };
  }

  // Actualizar dirección existente
  async updateAddress(
    userId: number,
    addressId: number,
    updateAddressDto: UpdateAddressDto,
  ) {
    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Si se cambia el label, verificar que no exista otro con el mismo label
    if (
      updateAddressDto.label &&
      updateAddressDto.label !== existingAddress.label
    ) {
      const duplicateLabel = await this.prisma.address.findFirst({
        where: {
          userId,
          label: updateAddressDto.label,
          id: { not: addressId },
        },
      });

      if (duplicateLabel) {
        throw new ConflictException(
          `Ya existe una dirección con la etiqueta "${updateAddressDto.label}"`,
        );
      }
    }

    // Si se marca como default, actualizar otras direcciones
    if (updateAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await this.prisma.address.update({
      where: { id: addressId },
      data: updateAddressDto,
    });

    // Si esta dirección es default, actualizar la referencia en User
    if (updatedAddress.isDefault) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddressId: updatedAddress.id },
      });
    }

    return {
      message: 'Dirección actualizada exitosamente',
      address: updatedAddress,
    };
  }

  // Eliminar dirección
  async deleteAddress(userId: number, addressId: number) {
    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Si es la dirección default, limpiar la referencia en User
    if (existingAddress.isDefault) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { defaultAddressId: null },
      });
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    // Si había más direcciones, establecer la primera como default
    if (existingAddress.isDefault) {
      const firstAddress = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (firstAddress) {
        await this.setDefaultAddress(userId, firstAddress.id);
      }
    }

    return {
      message: 'Dirección eliminada exitosamente',
    };
  }

  // Establecer dirección como predeterminada
  async setDefaultAddress(userId: number, addressId: number) {
    // Verificar que la dirección existe y pertenece al usuario
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Quitar default de todas las otras direcciones
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Establecer la nueva dirección como default
    const updatedAddress = await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    // Actualizar la referencia en User
    await this.prisma.user.update({
      where: { id: userId },
      data: { defaultAddressId: addressId },
    });

    return {
      message: 'Dirección establecida como predeterminada',
      address: updatedAddress,
    };
  }
}

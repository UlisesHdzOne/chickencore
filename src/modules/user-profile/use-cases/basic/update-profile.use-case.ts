import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProfileDto } from '../../dto/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, updateProfileDto: UpdateProfileDto) {
    // Verificar que el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Preparar datos para actualización
    const updateData: any = {};

    if (updateProfileDto.firstName !== undefined) {
      updateData.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      updateData.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.phoneNumber !== undefined) {
      updateData.phoneNumber = updateProfileDto.phoneNumber;
    }
    if (updateProfileDto.dateOfBirth !== undefined) {
      updateData.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
    }
    if (updateProfileDto.bio !== undefined) {
      updateData.bio = updateProfileDto.bio;
    }

    // Actualizar usuario
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profilePicture: true,
        dateOfBirth: true,
        bio: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Perfil actualizado exitosamente',
      user: updatedUser,
    };
  }
}

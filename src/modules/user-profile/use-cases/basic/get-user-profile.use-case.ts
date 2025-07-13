import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            id: true,
            label: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            isDefault: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { isDefault: 'desc' },
        },
        defaultAddress: {
          select: {
            id: true,
            label: true,
            street: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Calcular completitud del perfil
    const requiredFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'profilePicture',
    ];

    const completedFields = requiredFields.filter(
      (field) => user[field] && user[field] !== '',
    );

    const hasDefaultAddress = user.addresses.some((addr) => addr.isDefault);

    const profileCompleteness = {
      percentage: Math.round(
        ((completedFields.length + (hasDefaultAddress ? 1 : 0)) /
          (requiredFields.length + 1)) *
          100,
      ),
      missingFields: requiredFields.filter((field) => !user[field]),
      hasDefaultAddress,
    };

    return {
      ...user,
      profileCompleteness,
    };
  }
}

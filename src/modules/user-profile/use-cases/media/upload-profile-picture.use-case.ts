import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Multer } from 'multer';

@Injectable()
export class UploadProfilePictureUseCase {
  constructor(private readonly prisma: PrismaService) {}

  private readonly uploadPath = './uploads/profiles';
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  async execute(userId: number, file: Multer.File) {
    // Verificar que el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, profilePicture: true },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar archivo
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'El archivo es demasiado grande. Máximo permitido: 5MB',
      );
    }

    try {
      // Crear directorio si no existe
      await fs.mkdir(this.uploadPath, { recursive: true });

      // Eliminar foto anterior si existe
      if (existingUser.profilePicture) {
        const oldFilePath = path.join('.', existingUser.profilePicture);
        try {
          await fs.unlink(oldFilePath);
        } catch (error) {
          // Si no se puede eliminar el archivo anterior, continuamos
          console.warn('No se pudo eliminar la foto anterior:', error);
        }
      }

      // Generar nombre único para el archivo
      const fileExtension = path.extname(file.originalname);
      const fileName = `${userId}-${Date.now()}${fileExtension}`;
      const filePath = path.join(this.uploadPath, fileName);

      // Guardar archivo
      await fs.writeFile(filePath, file.buffer);

      // Actualizar URL en base de datos
      const imageUrl = `/uploads/profiles/${fileName}`;
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { profilePicture: imageUrl },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          updatedAt: true,
        },
      });

      return {
        message: 'Foto de perfil actualizada exitosamente',
        profilePicture: imageUrl,
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al procesar la imagen. Inténtalo de nuevo.',
      );
    }
  }
}

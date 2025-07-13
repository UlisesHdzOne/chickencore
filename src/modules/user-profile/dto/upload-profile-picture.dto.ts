import { Multer } from 'multer';
import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePictureDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo de imagen para la foto de perfil (JPG, PNG, WebP)',
  })
  file: Multer.File;
}

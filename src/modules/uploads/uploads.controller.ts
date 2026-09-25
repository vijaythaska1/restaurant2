import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AdminGuard } from '../../guards/admin.guard';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(UPLOAD_DIR)) {
            mkdirSync(UPLOAD_DIR, { recursive: true });
          }
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
          const ext = extname(file.originalname || '').toLowerCase() || '.jpg';
          cb(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase();
        const mime = (file.mimetype || '').toLowerCase();
        const allowedExtensions = [
          '.jpg',
          '.jpeg',
          '.png',
          '.webp',
          '.gif',
          '.svg',
          '.avif',
          '.heic',
          '.bmp',
        ];
        const isAllowedMime =
          mime.startsWith('image/') ||
          mime === 'application/octet-stream';
        const isAllowedExt = allowedExtensions.includes(ext);

        if (isAllowedMime || isAllowedExt) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only image files (JPG, PNG, WebP, GIF, SVG) are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const imageUrl = `/api/uploads/${file.filename}`;

    return {
      success: true,
      filename: file.filename,
      url: imageUrl,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

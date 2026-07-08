import { BadRequestException } from '@nestjs/common';
import { PROPERTY_IMAGE_MAX_BYTES } from '../properties.constants';

const NORMALIZED_MIME_TYPES: Record<string, 'image/jpeg' | 'image/png' | 'image/webp'> =
  {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/pjpeg': 'image/jpeg',
    'image/png': 'image/png',
    'image/x-png': 'image/png',
    'image/webp': 'image/webp',
  };

const EXTENSION_TO_MIME: Record<string, 'image/jpeg' | 'image/png' | 'image/webp'> =
  {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

const MIME_TO_EXTENSION: Record<
  'image/jpeg' | 'image/png' | 'image/webp',
  string
> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface ResolvedImageFile {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  extension: string;
}

function getExtensionFromFilename(filename: string): string | null {
  const parts = filename.toLowerCase().split('.');
  if (parts.length < 2) {
    return null;
  }

  return parts.at(-1) ?? null;
}

export function resolveImageFile(
  file: Express.Multer.File | undefined,
): ResolvedImageFile {
  if (!file) {
    throw new BadRequestException('Image file is required');
  }

  if (file.size > PROPERTY_IMAGE_MAX_BYTES) {
    throw new BadRequestException('Image must be 5 MB or smaller');
  }

  const normalizedMime = NORMALIZED_MIME_TYPES[file.mimetype.toLowerCase()];
  if (normalizedMime) {
    return {
      mimeType: normalizedMime,
      extension: MIME_TO_EXTENSION[normalizedMime],
    };
  }

  const extension = getExtensionFromFilename(file.originalname);
  if (extension && EXTENSION_TO_MIME[extension]) {
    const mimeType = EXTENSION_TO_MIME[extension];
    return {
      mimeType,
      extension: MIME_TO_EXTENSION[mimeType],
    };
  }

  throw new BadRequestException(
    'Only JPEG, JPG, PNG, and WebP images are allowed',
  );
}

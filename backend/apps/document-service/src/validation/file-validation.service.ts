import { createHash, randomUUID } from 'node:crypto';
import { basename, extname } from 'node:path';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fromBuffer } from 'file-type';

const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;
const DEFAULT_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'txt',
  'csv',
];
const DEFAULT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/gif',
  'text/plain',
  'text/csv',
];

export interface ValidatedUploadFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
  checksumSha256: string;
}

@Injectable()
export class FileValidationService {
  constructor(private readonly config: ConfigService) {}

  async validate(file: Express.Multer.File): Promise<ValidatedUploadFile> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const maxBytes = Number(
      this.config.get<string>('DOCUMENT_MAX_UPLOAD_BYTES', String(DEFAULT_MAX_BYTES)),
    );
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Empty files are not allowed');
    }
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `File exceeds maximum allowed size of ${maxBytes} bytes`,
      );
    }

    const sanitizedOriginalName = this.sanitizeOriginalName(file.originalname);
    const extension = this.extractExtension(sanitizedOriginalName);
    const allowedExtensions = this.getAllowedExtensions();
    if (!allowedExtensions.includes(extension)) {
      throw new BadRequestException(`File extension .${extension} is not allowed`);
    }

    const allowedMimeTypes = this.getAllowedMimeTypes();
    const declaredMime = (file.mimetype || '').toLowerCase();
    if (!allowedMimeTypes.includes(declaredMime)) {
      throw new BadRequestException(`MIME type ${declaredMime} is not allowed`);
    }

    const detected = await fromBuffer(file.buffer);
  const detectedMime = detected?.mime?.toLowerCase();
    if (detectedMime && !allowedMimeTypes.includes(detectedMime)) {
      throw new BadRequestException(
        'File content type is not allowed based on magic-byte inspection',
      );
    }
    if (detectedMime && !this.mimeMatchesExtension(detectedMime, extension)) {
      throw new BadRequestException(
        'File extension does not match detected content type',
      );
    }
    if (detectedMime && detectedMime !== declaredMime) {
      throw new BadRequestException(
        'Declared MIME type does not match file content',
      );
    }

    const checksumSha256 = createHash('sha256').update(file.buffer).digest('hex');

    return {
      buffer: file.buffer,
      originalName: sanitizedOriginalName,
      mimeType: declaredMime,
      size: file.size,
      extension,
      checksumSha256,
    };
  }

  buildStorageKey(originalName: string): string {
    const safeName = this.sanitizeOriginalName(originalName).replace(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );
    return `${randomUUID()}-${safeName}`;
  }

  private sanitizeOriginalName(originalName: string): string {
    const base = basename(originalName || 'upload.bin').trim();
    if (!base || base === '.' || base === '..') {
      throw new BadRequestException('Invalid file name');
    }
    if (/[\u0000-\u001f\u007f]/.test(base)) {
      throw new BadRequestException('File name contains invalid control characters');
    }
    if (base.includes('/') || base.includes('\\')) {
      throw new BadRequestException('File name must not contain path separators');
    }
    return base.slice(0, 255);
  }

  private extractExtension(fileName: string): string {
    const ext = extname(fileName).replace('.', '').toLowerCase();
    if (!ext) {
      throw new BadRequestException('File must have an extension');
    }
    return ext;
  }

  private getAllowedExtensions(): string[] {
    const fromEnv = this.config.get<string>('DOCUMENT_ALLOWED_EXTENSIONS');
    if (!fromEnv) {
      return DEFAULT_EXTENSIONS;
    }
    return fromEnv
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
  }

  private getAllowedMimeTypes(): string[] {
    const fromEnv = this.config.get<string>('DOCUMENT_ALLOWED_MIME_TYPES');
    if (!fromEnv) {
      return DEFAULT_MIME_TYPES;
    }
    return fromEnv
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
  }

  private mimeMatchesExtension(mime: string, extension: string): boolean {
    const map: Record<string, string[]> = {
      pdf: ['application/pdf'],
      doc: ['application/msword'],
      docx: [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      xls: ['application/vnd.ms-excel'],
      xlsx: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      ppt: ['application/vnd.ms-powerpoint'],
      pptx: [
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
      png: ['image/png'],
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
      gif: ['image/gif'],
      txt: ['text/plain'],
      csv: ['text/csv', 'text/plain', 'application/vnd.ms-excel'],
    };
    const allowed = map[extension];
    if (!allowed) {
      return false;
    }
    return allowed.includes(mime);
  }
}
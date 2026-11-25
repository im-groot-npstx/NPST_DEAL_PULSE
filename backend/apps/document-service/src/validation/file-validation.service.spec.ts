import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { FileValidationService } from './file-validation.service';

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FileValidationService,
        {
          provide: ConfigService,
          useValue: {
            get: (_key: string, defaultValue?: string) => defaultValue,
          },
        },
      ],
    }).compile();
    service = moduleRef.get(FileValidationService);
  });

  it('rejects empty files', async () => {
    await expect(
      service.validate({
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 0,
        buffer: Buffer.alloc(0),
      } as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects filenames with control characters', async () => {
    await expect(
      service.validate({
        originalname: 'bad\u0000name.txt',
        mimetype: 'text/plain',
        size: 4,
        buffer: Buffer.from('test'),
      } as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts valid text files', async () => {
    const result = await service.validate({
      originalname: 'notes.txt',
      mimetype: 'text/plain',
      size: 11,
      buffer: Buffer.from('hello world'),
    } as Express.Multer.File);

    expect(result.originalName).toBe('notes.txt');
    expect(result.mimeType).toBe('text/plain');
    expect(result.checksumSha256).toHaveLength(64);
  });

  it('never trusts raw filename as storage key', () => {
    const key = service.buildStorageKey('../../evil.txt');
    expect(key.includes('/')).toBe(false);
    expect(key.includes('..')).toBe(false);
    expect(key.endsWith('evil.txt')).toBe(true);
  });
});
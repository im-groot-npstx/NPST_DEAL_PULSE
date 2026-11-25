import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { UploadsService } from './uploads.service';

const maxUploadBytes = Number(
  process.env.DOCUMENT_MAX_UPLOAD_BYTES ?? 25 * 1024 * 1024,
);

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: maxUploadBytes },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.upload(file);
  }
}
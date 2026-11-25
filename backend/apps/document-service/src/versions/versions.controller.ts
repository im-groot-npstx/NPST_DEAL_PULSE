import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { DocumentsService } from '../documents/documents.service';

import { VersionsService } from './versions.service';

@ApiTags('Document Versions')
@Controller('documents/:documentId/versions')
export class VersionsController {
  constructor(
    private readonly versionsService: VersionsService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Upload a new immutable version for an existing document' })
  uploadVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.versionsService.uploadNewVersion(documentId, file);
  }

  @Get()
  @ApiOperation({ summary: 'List version history for a document' })
  list(@Param('documentId', ParseUUIDPipe) documentId: string) {
    return this.versionsService.listVersions(documentId);
  }

  @Get(':versionNumber/download')
  @ApiOperation({ summary: 'Download a specific document version' })
  @ApiParam({ name: 'versionNumber', type: Number })
  async downloadVersion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const version = await this.versionsService.getVersionForDownload(
      documentId,
      versionNumber,
    );
    const payload = await this.documentsService.getStreamForStorageKey(
      version.storageKey,
      version.originalName,
      version.mimeType,
      Number(version.size),
    );
    res.set({
      'Content-Type': payload.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(payload.originalName)}"`,
      'Content-Length': payload.size.toString(),
    });
    return new StreamableFile(payload.stream);
  }
}
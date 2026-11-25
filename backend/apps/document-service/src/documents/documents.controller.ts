import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { UpdateDocumentMetadataDto } from '../dto/update-document-metadata.dto';

import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List documents with pagination' })
  list(@Query() query: PaginationQueryDto) {
    return this.documentsService.listDocuments(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata by ID' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update editable metadata fields (originalName, uploadedBy)',
  })
  updateMetadata(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentMetadataDto,
  ) {
    return this.documentsService.updateMetadata(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document and all of its versions' })
  @ApiQuery({
    name: 'force',
    required: false,
    description: 'Set true to delete when multiple entity attachments exist',
  })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('force') force?: string,
  ) {
    return this.documentsService.deleteDocument(id, force === 'true');
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download the current version of a document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const document = await this.documentsService.getDocumentForDownload(id);
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(document.originalName)}"`,
      'Content-Length': document.size.toString(),
    });
    return new StreamableFile(document.stream);
  }
}
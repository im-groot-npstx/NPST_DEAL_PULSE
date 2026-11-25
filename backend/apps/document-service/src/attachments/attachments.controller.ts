import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AttachDocumentDto } from '../dto/attach-document.dto';

import { AttachmentsService } from './attachments.service';

@ApiTags('Document Attachments')
@Controller('documents/:documentId/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Attach a document to a CRM entity' })
  @ApiParam({ name: 'documentId', description: 'Document UUID' })
  attach(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: AttachDocumentDto,
  ) {
    return this.attachmentsService.attach(documentId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List attachments for a document' })
  list(@Param('documentId', ParseUUIDPipe) documentId: string) {
    return this.attachmentsService.listDocumentAttachments(documentId);
  }

  @Delete(':attachmentId')
  @ApiOperation({ summary: 'Detach a document from an entity without deleting the file' })
  @ApiResponse({ status: 200, description: 'Detached successfully' })
  detach(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ) {
    return this.attachmentsService.detach(documentId, attachmentId);
  }
}
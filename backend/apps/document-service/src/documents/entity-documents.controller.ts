import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { EntityDocumentsQueryDto } from '../dto/entity-documents-query.dto';

import { DocumentsService } from './documents.service';

@ApiTags('Entity Documents')
@Controller('entity-documents')
export class EntityDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch documents attached to a CRM entity (Lead, Proposal, etc.)',
  })
  listByEntity(@Query() query: EntityDocumentsQueryDto) {
    return this.documentsService.listByEntity(query);
  }
}
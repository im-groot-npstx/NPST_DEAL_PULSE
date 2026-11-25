import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { DOCUMENT_ENTITY_TYPES } from '../common/document-entity-type';

export class AttachDocumentDto {
  @ApiProperty({ enum: DOCUMENT_ENTITY_TYPES, example: 'LEAD' })
  @IsString()
  @IsIn([...DOCUMENT_ENTITY_TYPES])
  entityType!: string;

  @ApiProperty({ example: 'lead-uuid' })
  @IsString()
  @MaxLength(100)
  entityId!: string;

  @ApiPropertyOptional({ default: 'ATTACHMENT', example: 'RFP' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relationshipType?: string = 'ATTACHMENT';
}
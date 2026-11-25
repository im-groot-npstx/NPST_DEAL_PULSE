import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { DOCUMENT_ENTITY_TYPES } from '../common/document-entity-type';

import { PaginationQueryDto } from './pagination-query.dto';

export class EntityDocumentsQueryDto extends PaginationQueryDto {
  @ApiProperty({ enum: DOCUMENT_ENTITY_TYPES })
  @IsString()
  @IsIn([...DOCUMENT_ENTITY_TYPES])
  entityType!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  entityId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relationshipType?: string;
}
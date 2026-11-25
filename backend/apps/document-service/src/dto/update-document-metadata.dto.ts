import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDocumentMetadataDto {
  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalName?: string;

  @ApiPropertyOptional({ description: 'Logical owner user ID from calling service' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  uploadedBy?: string;
}
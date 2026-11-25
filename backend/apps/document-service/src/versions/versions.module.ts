import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '../common/common.module';
import { DocumentsModule } from '../documents/documents.module';
import { Document as DocumentEntity } from '../entities/document.entity';
import { DocumentVersion } from '../entities/document-version.entity';

import { VersionsController } from './versions.controller';
import { VersionsService } from './versions.service';

@Module({
  imports: [
    CommonModule,
    DocumentsModule,
    TypeOrmModule.forFeature([DocumentEntity, DocumentVersion]),
  ],
  controllers: [VersionsController],
  providers: [VersionsService],
})
export class VersionsModule {}
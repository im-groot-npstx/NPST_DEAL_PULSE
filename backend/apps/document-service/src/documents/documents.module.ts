import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document as DocumentEntity } from '../entities/document.entity';
import { DocumentAttachment } from '../entities/document-attachment.entity';
import { DocumentVersion } from '../entities/document-version.entity';
import { StorageModule } from '../storage/storage.module';

import { DocumentsController } from './documents.controller';
import { EntityDocumentsController } from './entity-documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([
      DocumentEntity,
      DocumentVersion,
      DocumentAttachment,
    ]),
  ],
  controllers: [DocumentsController, EntityDocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
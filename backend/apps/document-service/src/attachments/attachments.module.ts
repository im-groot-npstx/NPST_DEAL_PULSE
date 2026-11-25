import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document as DocumentEntity } from '../entities/document.entity';
import { DocumentAttachment } from '../entities/document-attachment.entity';

import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity, DocumentAttachment]),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
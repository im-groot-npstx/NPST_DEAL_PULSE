import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentVersion } from '../entities/document-version.entity';
import { StorageModule } from '../storage/storage.module';
import { ClamavService } from '../uploads/clamav.service';
import { ValidationModule } from '../validation/validation.module';

import { DocumentIngestionService } from './document-ingestion.service';

@Module({
  imports: [
    ValidationModule,
    StorageModule,
    TypeOrmModule.forFeature([DocumentVersion]),
  ],
  providers: [DocumentIngestionService, ClamavService],
  exports: [DocumentIngestionService, ClamavService],
})
export class CommonModule {}
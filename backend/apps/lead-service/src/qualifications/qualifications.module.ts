import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadQualification } from '../entities/lead-qualification.entity';
import { HistoryModule } from '../history/history.module';
import { QualificationsController } from './qualifications.controller';
import { QualificationsService } from './qualifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadQualification, Lead]),
    HistoryModule,
  ],
  controllers: [QualificationsController],
  providers: [QualificationsService],
})
export class QualificationsModule {}
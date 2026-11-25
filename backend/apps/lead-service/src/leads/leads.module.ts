import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../entities/lead.entity';
import { HistoryModule } from '../history/history.module';
import { ApprovalIntegration } from '../integrations/approval.integration';
import { OpportunityIntegration } from '../integrations/opportunity.integration';
import { LeadLifecycleService } from './lead-lifecycle.service';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), HistoryModule],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadLifecycleService,
    ApprovalIntegration,
    OpportunityIntegration,
  ],
  exports: [LeadsService],
})
export class LeadsModule {}
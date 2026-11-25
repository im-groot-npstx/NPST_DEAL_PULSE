import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeadHistory } from '../entities/lead-history.entity';
import { HistoryService } from './history.service';

@ApiTags('Lead History')
@Controller('leads/:leadId/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get lead change history (newest first)' })
  @ApiParam({ name: 'leadId', format: 'uuid' })
  @ApiResponse({ status: 200, type: [LeadHistory] })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  getHistory(
    @Param('leadId', ParseUUIDPipe) leadId: string,
  ): Promise<LeadHistory[]> {
    return this.historyService.findByLeadId(leadId);
  }
}
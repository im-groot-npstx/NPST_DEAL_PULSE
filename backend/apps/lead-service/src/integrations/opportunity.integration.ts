import { Injectable, Logger } from '@nestjs/common';

export interface LeadConversionPayload {
  leadId: string;
  convertedBy?: string;
}

/**
 * Future integration with the Opportunity microservice (Stage 1 – Qualification).
 * Does not write to opportunity DB from Lead Service.
 */
@Injectable()
export class OpportunityIntegration {
  private readonly logger = new Logger(OpportunityIntegration.name);

  async convertLeadToOpportunity(payload: LeadConversionPayload): Promise<void> {
    this.logger.log(
      `Opportunity integration pending: convert lead ${payload.leadId} (by=${payload.convertedBy ?? 'unknown'})`,
    );
  }
}
import { Injectable, Logger } from '@nestjs/common';

export interface LeadApprovalRequestPayload {
  leadId: string;
  requestedBy?: string;
}

/**
 * Future integration with the Approval microservice.
 * Does not write to approval DB from Lead Service.
 */
@Injectable()
export class ApprovalIntegration {
  private readonly logger = new Logger(ApprovalIntegration.name);

  async submitLeadForApproval(payload: LeadApprovalRequestPayload): Promise<void> {
    this.logger.log(
      `Approval integration pending: lead ${payload.leadId} (requestedBy=${payload.requestedBy ?? 'unknown'})`,
    );
  }
}
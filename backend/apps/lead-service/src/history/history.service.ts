import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadHistory } from '../entities/lead-history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(LeadHistory)
    private readonly historyRepo: Repository<LeadHistory>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

  async record(
    leadId: string,
    action: string,
    oldValue: Record<string, unknown> | null,
    newValue: Record<string, unknown> | null,
    changedBy?: string,
  ): Promise<LeadHistory> {
    const entry = this.historyRepo.create({
      leadId,
      action,
      oldValue,
      newValue,
      changedBy,
    });
    return this.historyRepo.save(entry);
  }

  async findByLeadId(leadId: string): Promise<LeadHistory[]> {
    await this.assertLeadExists(leadId);
    return this.historyRepo.find({
      where: { leadId },
      order: { createdAt: 'DESC' },
    });
  }

  private async assertLeadExists(leadId: string): Promise<void> {
    const exists = await this.leadRepo.exists({
      where: { id: leadId },
      withDeleted: false,
    });
    if (!exists) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }
  }
}
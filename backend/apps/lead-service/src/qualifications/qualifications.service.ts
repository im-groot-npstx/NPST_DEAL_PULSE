import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadQualification } from '../entities/lead-qualification.entity';
import { HistoryService } from '../history/history.service';
import { computeDiff } from '../common/utils/object-diff.util';
import { CreateQualificationDto } from './dto/create-qualification.dto';
import { UpdateQualificationDto } from './dto/update-qualification.dto';

@Injectable()
export class QualificationsService {
  constructor(
    @InjectRepository(LeadQualification)
    private readonly qualificationRepo: Repository<LeadQualification>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly historyService: HistoryService,
  ) {}

  async create(
    leadId: string,
    dto: CreateQualificationDto,
    changedBy?: string,
  ): Promise<LeadQualification> {
    const lead = await this.findActiveLead(leadId);
    const existing = await this.qualificationRepo.findOne({
      where: { lead: { id: lead.id } },
    });
    if (existing) {
      throw new ConflictException(
        `Qualification already exists for lead ${leadId}`,
      );
    }
    const qualification = this.qualificationRepo.create({
      ...dto,
      lead,
    });
    const saved = await this.qualificationRepo.save(qualification);
    await this.historyService.record(
      leadId,
      'QUALIFICATION_CREATED',
      null,
      this.snapshot(saved),
      changedBy,
    );
    return saved;
  }

  async findByLeadId(leadId: string): Promise<LeadQualification> {
    await this.findActiveLead(leadId);
    const qualification = await this.qualificationRepo.findOne({
      where: { lead: { id: leadId } },
      relations: { lead: true },
    });
    if (!qualification) {
      throw new NotFoundException(
        `Qualification not found for lead ${leadId}`,
      );
    }
    return qualification;
  }

  async update(
    leadId: string,
    dto: UpdateQualificationDto,
    changedBy?: string,
  ): Promise<LeadQualification> {
    const qualification = await this.findByLeadId(leadId);
    const before = this.snapshot(qualification);
    Object.assign(qualification, dto);
    const saved = await this.qualificationRepo.save(qualification);
    const after = this.snapshot(saved);
    const { oldValue, newValue } = computeDiff(before, after);
    if (Object.keys(newValue).length > 0) {
      await this.historyService.record(
        leadId,
        'QUALIFICATION_UPDATED',
        oldValue,
        newValue,
        changedBy,
      );
    }
    return saved;
  }

  private async findActiveLead(leadId: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }
    return lead;
  }

  private snapshot(
    qualification: LeadQualification,
  ): Record<string, unknown> {
    const {
      id,
      hasApprovedBudget,
      budget,
      bant,
      hasNeed,
      need,
      whoIsTheAuthority,
      authority,
      timeline,
      doWeKnowTheTimeline,
      qualificationStatus,
      score,
      notes,
    } = qualification;
    return {
      id,
      hasApprovedBudget,
      budget,
      bant,
      hasNeed,
      need,
      whoIsTheAuthority,
      authority,
      timeline,
      doWeKnowTheTimeline,
      qualificationStatus,
      score,
      notes,
    };
  }
}
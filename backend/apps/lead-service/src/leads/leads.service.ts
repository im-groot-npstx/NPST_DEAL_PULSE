import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { HistoryService } from '../history/history.service';
import {
  computeDiff,
  pickWritableLeadSnapshot,
} from '../common/utils/object-diff.util';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AssessNeedDto } from './dto/assess-need.dto';
import { LeadLifecycleService } from './lead-lifecycle.service';

const LEAD_DATE_FIELDS = [
  'stage1Entered',
  'stage2Entered',
  'stage3Entered',
  'stage4Entered',
  'lastTransferDate',
] as const;

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly historyService: HistoryService,
    private readonly lifecycleService: LeadLifecycleService,
  ) {}

  async create(dto: CreateLeadDto, changedBy?: string): Promise<Lead> {
    const lead = this.leadRepo.create(this.mapDtoToEntity(dto));
    this.lifecycleService.ensureDefaultStage(lead);
    const saved = await this.leadRepo.save(lead);
    await this.historyService.record(
      saved.id,
      'LEAD_CREATED',
      null,
      pickWritableLeadSnapshot(saved as unknown as Record<string, unknown>),
      changedBy,
    );
    return saved;
  }

  async findAll(): Promise<Lead[]> {
    return this.leadRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: { qualification: true },
    });
    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }
    return lead;
  }

  async update(
    id: string,
    dto: UpdateLeadDto,
    changedBy?: string,
  ): Promise<Lead> {
    const lead = await this.findOne(id);
    const before = pickWritableLeadSnapshot(lead as unknown as Record<string, unknown>);
    this.applyDto(lead, dto);
    const saved = await this.leadRepo.save(lead);
    const after = pickWritableLeadSnapshot(saved as unknown as Record<string, unknown>);
    const { oldValue, newValue } = computeDiff(before, after);
    if (Object.keys(newValue).length > 0) {
      await this.historyService.record(
        id,
        'LEAD_UPDATED',
        oldValue,
        newValue,
        changedBy,
      );
    }
    return saved;
  }

  async remove(id: string, changedBy?: string): Promise<void> {
    const lead = await this.findOne(id);
    const snapshot = pickWritableLeadSnapshot(lead as unknown as Record<string, unknown>);
    await this.leadRepo.softRemove(lead);
    await this.historyService.record(
      id,
      'LEAD_SOFT_DELETED',
      snapshot,
      null,
      changedBy,
    );
  }

  async assessNeed(
    id: string,
    dto: AssessNeedDto,
    changedBy?: string,
  ): Promise<Lead> {
    const lead = await this.findOne(id);
    const before = pickWritableLeadSnapshot(lead as unknown as Record<string, unknown>);
    await this.lifecycleService.assessNeed(
      lead,
      dto.hasNeed,
      { reconnectInMonths: dto.reconnectInMonths },
      changedBy,
    );
    const saved = await this.leadRepo.save(lead);
    const after = pickWritableLeadSnapshot(saved as unknown as Record<string, unknown>);
    const { oldValue, newValue } = computeDiff(before, after);
    await this.historyService.record(
      id,
      'LEAD_NEED_ASSESSED',
      oldValue,
      newValue,
      changedBy,
    );
    return saved;
  }

  async approveLead(id: string, changedBy?: string): Promise<Lead> {
    const lead = await this.findOne(id);
    const before = pickWritableLeadSnapshot(lead as unknown as Record<string, unknown>);
    await this.lifecycleService.markQualifiedAfterApproval(lead, changedBy);
    const saved = await this.leadRepo.save(lead);
    const after = pickWritableLeadSnapshot(saved as unknown as Record<string, unknown>);
    const { oldValue, newValue } = computeDiff(before, after);
    await this.historyService.record(
      id,
      'LEAD_APPROVED',
      oldValue,
      newValue,
      changedBy,
    );
    return saved;
  }

  async moveToWorking(id: string, changedBy?: string): Promise<Lead> {
    const lead = await this.findOne(id);
    const before = pickWritableLeadSnapshot(lead as unknown as Record<string, unknown>);
    this.lifecycleService.moveToWorking(lead);
    const saved = await this.leadRepo.save(lead);
    const after = pickWritableLeadSnapshot(saved as unknown as Record<string, unknown>);
    const { oldValue, newValue } = computeDiff(before, after);
    await this.historyService.record(
      id,
      'LEAD_STAGE_WORKING',
      oldValue,
      newValue,
      changedBy,
    );
    return saved;
  }

  private mapDtoToEntity(dto: CreateLeadDto): Partial<Lead> {
    const payload = { ...dto } as Record<string, unknown>;
    for (const field of LEAD_DATE_FIELDS) {
      const value = payload[field];
      if (typeof value === 'string') {
        payload[field] = new Date(value);
      }
    }
    return payload as Partial<Lead>;
  }

  private applyDto(lead: Lead, dto: CreateLeadDto | UpdateLeadDto): Lead {
    const payload = { ...dto } as Record<string, unknown>;
    for (const field of LEAD_DATE_FIELDS) {
      const value = payload[field];
      if (typeof value === 'string') {
        payload[field] = new Date(value);
      }
    }
    Object.assign(lead, payload);
    return lead;
  }
}
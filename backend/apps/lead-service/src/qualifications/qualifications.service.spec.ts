import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadQualification } from '../entities/lead-qualification.entity';
import { HistoryService } from '../history/history.service';
import { QualificationsService } from './qualifications.service';

describe('QualificationsService', () => {
  let service: QualificationsService;
  const qualificationRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const leadRepo = {
    findOne: jest.fn(),
  };
  const historyService = { record: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        QualificationsService,
        { provide: getRepositoryToken(LeadQualification), useValue: qualificationRepo },
        { provide: getRepositoryToken(Lead), useValue: leadRepo },
        { provide: HistoryService, useValue: historyService },
      ],
    }).compile();
    service = module.get(QualificationsService);
  });

  it('rejects duplicate qualification', async () => {
    const leadId = '00000000-0000-4000-8000-000000000010';
    leadRepo.findOne.mockResolvedValue({ id: leadId });
    qualificationRepo.findOne.mockResolvedValue({ id: 'q-1' });
    await expect(service.create(leadId, {})).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('creates qualification and history', async () => {
    const leadId = '00000000-0000-4000-8000-000000000010';
    leadRepo.findOne.mockResolvedValue({ id: leadId });
    qualificationRepo.findOne.mockResolvedValueOnce(null);
    qualificationRepo.create.mockReturnValue({ lead: { id: leadId } });
    qualificationRepo.save.mockResolvedValue({ id: 'q-1', budget: '1M' });
    await service.create(leadId, { budget: '1M' }, 'user-1');
    expect(historyService.record).toHaveBeenCalled();
  });

  it('throws when lead not found', async () => {
    leadRepo.findOne.mockResolvedValue(null);
    await expect(
      service.findByLeadId('00000000-0000-4000-8000-000000000099'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
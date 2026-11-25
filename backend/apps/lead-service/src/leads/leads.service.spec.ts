import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm'; // mocked via jest-setup
import { Lead } from '../entities/lead.entity';
import { HistoryService } from '../history/history.service';
import { LeadLifecycleService } from './lead-lifecycle.service';
import { LeadsService } from './leads.service';

describe('LeadsService', () => {
  let service: LeadsService;
  const leadRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softRemove: jest.fn(),
  };
  const historyService = {
    record: jest.fn(),
  };
  const lifecycleService = {
    ensureDefaultStage: jest.fn(),
    moveToWorking: jest.fn(),
    assessNeed: jest.fn(),
    markQualifiedAfterApproval: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: getRepositoryToken(Lead), useValue: leadRepo },
        { provide: HistoryService, useValue: historyService },
        { provide: LeadLifecycleService, useValue: lifecycleService },
      ],
    }).compile();
    service = module.get(LeadsService);
  });

  it('creates a lead and writes history', async () => {
    const dto = { company: 'Acme' };
    leadRepo.create.mockReturnValue(dto);
    leadRepo.save.mockResolvedValue({ id: 'lead-1', company: 'Acme' });
    historyService.record.mockResolvedValue({});
    const result = await service.create(dto, 'user-1');
    expect(result.id).toBe('lead-1');
    expect(historyService.record).toHaveBeenCalledWith(
      'lead-1',
      'LEAD_CREATED',
      null,
      expect.any(Object),
      'user-1',
    );
  });

  it('throws when lead missing', async () => {
    leadRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('00000000-0000-4000-8000-000000000001')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists leads ordered by createdAt', async () => {
    leadRepo.find.mockResolvedValue([]);
    await service.findAll();
    expect(leadRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ order: { createdAt: 'DESC' } }),
    );
  });

  it('soft deletes a lead', async () => {
    const lead = { id: 'lead-1', company: 'Acme' };
    leadRepo.findOne.mockResolvedValue(lead);
    await service.remove('lead-1');
    expect(leadRepo.softRemove).toHaveBeenCalledWith(lead);
  });
});
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadHistory } from '../entities/lead-history.entity';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  let service: HistoryService;
  const historyRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn() };
  const leadRepo = { exists: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        HistoryService,
        { provide: getRepositoryToken(LeadHistory), useValue: historyRepo },
        { provide: getRepositoryToken(Lead), useValue: leadRepo },
      ],
    }).compile();
    service = module.get(HistoryService);
  });

  it('records history entries', async () => {
    historyRepo.create.mockReturnValue({ action: 'X' });
    historyRepo.save.mockResolvedValue({ id: 'h-1' });
    const saved = await service.record('lead-1', 'X', null, { a: 1 });
    expect(saved.id).toBe('h-1');
  });

  it('returns history newest first', async () => {
    leadRepo.exists.mockResolvedValue(true);
    historyRepo.find.mockResolvedValue([]);
    await service.findByLeadId('00000000-0000-4000-8000-000000000001');
    expect(historyRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ order: { createdAt: 'DESC' } }),
    );
  });

  it('throws when lead missing for history listing', async () => {
    leadRepo.exists.mockResolvedValue(false);
    await expect(
      service.findByLeadId('00000000-0000-4000-8000-000000000001'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
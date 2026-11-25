import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

describe('LeadsController (validation)', () => {
  let app: INestApplication;
  const leadsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    moveToWorking: jest.fn(),
    assessNeed: jest.fn(),
    approveLead: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [{ provide: LeadsService, useValue: leadsService }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects invalid uuid path params', async () => {
    await request(app.getHttpServer())
      .get('/leads/not-a-uuid')
      .expect(400);
  });

  it('rejects unknown dto properties', async () => {
    await request(app.getHttpServer())
      .post('/leads')
      .send({ company: 'Acme', unknownField: true })
      .expect(400);
  });

  it('accepts valid create payload', async () => {
    leadsService.create.mockResolvedValue({ id: '00000000-0000-4000-8000-000000000001' });
    await request(app.getHttpServer())
      .post('/leads')
      .send({ company: 'Acme' })
      .expect(201);
  });
});
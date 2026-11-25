import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LeadQualification } from '../entities/lead-qualification.entity';
import { ChangedBy } from '../common/decorators/changed-by.decorator';
import { CreateQualificationDto } from './dto/create-qualification.dto';
import { UpdateQualificationDto } from './dto/update-qualification.dto';
import { QualificationsService } from './qualifications.service';

@ApiTags('Lead Qualification')
@ApiBearerAuth()
@Controller('leads/:leadId/qualification')
export class QualificationsController {
  constructor(private readonly qualificationsService: QualificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create qualification for a lead (one-to-one)' })
  @ApiParam({ name: 'leadId', format: 'uuid' })
  @ApiResponse({ status: 201, type: LeadQualification })
  @ApiResponse({ status: 409, description: 'Qualification already exists' })
  create(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: CreateQualificationDto,
    @ChangedBy() changedBy?: string,
  ): Promise<LeadQualification> {
    return this.qualificationsService.create(leadId, dto, changedBy);
  }

  @Get()
  @ApiOperation({ summary: 'Get qualification for a lead' })
  @ApiParam({ name: 'leadId', format: 'uuid' })
  @ApiResponse({ status: 200, type: LeadQualification })
  findOne(
    @Param('leadId', ParseUUIDPipe) leadId: string,
  ): Promise<LeadQualification> {
    return this.qualificationsService.findByLeadId(leadId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update lead qualification' })
  @ApiParam({ name: 'leadId', format: 'uuid' })
  @ApiResponse({ status: 200, type: LeadQualification })
  update(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: UpdateQualificationDto,
    @ChangedBy() changedBy?: string,
  ): Promise<LeadQualification> {
    return this.qualificationsService.update(leadId, dto, changedBy);
  }
}
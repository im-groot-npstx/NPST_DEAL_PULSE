import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Document as DocumentEntity } from '../entities/document.entity';
import { DocumentAttachment } from '../entities/document-attachment.entity';
import { AttachDocumentDto } from '../dto/attach-document.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(DocumentAttachment)
    private readonly attachmentRepository: Repository<DocumentAttachment>,
  ) {}

  async attach(documentId: string, dto: AttachDocumentDto) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const relationshipType = dto.relationshipType ?? 'ATTACHMENT';
    const existing = await this.attachmentRepository.findOne({
      where: {
        documentId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        relationshipType,
      },
    });
    if (existing) {
      throw new ConflictException('Document is already attached to this entity');
    }

    const attachment = this.attachmentRepository.create({
      documentId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      relationshipType,
    });
    const saved = await this.attachmentRepository.save(attachment);
    return {
      message: 'Document attached successfully',
      attachment: saved,
    };
  }

  async detach(documentId: string, attachmentId: string) {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, documentId },
    });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    await this.attachmentRepository.remove(attachment);
    return {
      message: 'Document detached successfully',
      attachmentId,
      documentId,
    };
  }

  async listDocumentAttachments(documentId: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return this.attachmentRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
  }
}
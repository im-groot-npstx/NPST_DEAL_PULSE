import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Readable } from 'node:stream';
import { Repository } from 'typeorm';

import { toPublicDocument } from '../common/document-response.mapper';
import { EntityDocumentsQueryDto } from '../dto/entity-documents-query.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { UpdateDocumentMetadataDto } from '../dto/update-document-metadata.dto';
import { Document as DocumentEntity } from '../entities/document.entity';
import { DocumentAttachment } from '../entities/document-attachment.entity';
import { DocumentVersion } from '../entities/document-version.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(DocumentVersion)
    private readonly versionRepository: Repository<DocumentVersion>,
    @InjectRepository(DocumentAttachment)
    private readonly attachmentRepository: Repository<DocumentAttachment>,
    private readonly storageService: StorageService,
  ) {}

  async getById(id: string) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return toPublicDocument(document);
  }

  async listDocuments(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const [documents, total] = await this.documentRepository.findAndCount({
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: documents.map(toPublicDocument),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async listByEntity(query: EntityDocumentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.attachmentRepository
      .createQueryBuilder('attachment')
      .innerJoinAndSelect('attachment.document', 'document')
      .where('attachment.entityType = :entityType', {
        entityType: query.entityType,
      })
      .andWhere('attachment.entityId = :entityId', { entityId: query.entityId });

    if (query.relationshipType) {
      qb.andWhere('attachment.relationshipType = :relationshipType', {
        relationshipType: query.relationshipType,
      });
    }

    qb.orderBy('document.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [attachments, total] = await qb.getManyAndCount();

    return {
      entityType: query.entityType,
      entityId: query.entityId,
      items: attachments.map((attachment) => ({
        attachmentId: attachment.id,
        relationshipType: attachment.relationshipType,
        attachedAt: attachment.createdAt,
        document: toPublicDocument(attachment.document),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateMetadata(id: string, dto: UpdateDocumentMetadataDto) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (dto.originalName !== undefined) {
      document.originalName = dto.originalName;
    }
    if (dto.uploadedBy !== undefined) {
      document.uploadedBy = dto.uploadedBy;
    }

    const saved = await this.documentRepository.save(document);
    return {
      message: 'Document metadata updated successfully',
      document: toPublicDocument(saved),
    };
  }

  async getDocumentForDownload(id: string) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const currentVersion = await this.versionRepository.findOne({
      where: {
        documentId: id,
        versionNumber: document.currentVersionNumber,
      },
    });

    const storageKey = currentVersion?.storageKey ?? document.storageKey;
    const originalName = currentVersion?.originalName ?? document.originalName;
    const mimeType = currentVersion?.mimeType ?? document.mimeType;
    const size = Number(currentVersion?.size ?? document.size);

    return this.getStreamForStorageKey(storageKey, originalName, mimeType, size);
  }

  async getStreamForStorageKey(
    storageKey: string,
    originalName: string,
    mimeType: string,
    size: number,
  ) {
    const storageResponse = await this.storageService.getFile(storageKey);
    if (!storageResponse.Body) {
      throw new NotFoundException('Document file is unavailable in storage');
    }

    const stream = await this.toNodeReadable(storageResponse.Body);
    return { originalName, mimeType, size, stream };
  }

  async deleteDocument(id: string, force = false) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const attachmentCount = await this.attachmentRepository.count({
      where: { documentId: id },
    });
    if (attachmentCount > 1 && !force) {
      throw new ConflictException(
        'Document is attached to multiple entities. Reattach or pass force=true to delete.',
      );
    }

    const versions = await this.versionRepository.find({ where: { documentId: id } });
    const storageKeys = new Set([
      ...versions.map((version) => version.storageKey),
      document.storageKey,
    ]);

    await this.documentRepository.remove(document);

    const cleanupErrors: string[] = [];
    for (const key of storageKeys) {
      try {
        await this.storageService.deleteFile(key);
      } catch {
        cleanupErrors.push(key);
      }
    }

    if (cleanupErrors.length > 0) {
      throw new InternalServerErrorException(
        'Document metadata deleted but some storage objects could not be removed',
      );
    }

    return {
      message: 'Document deleted successfully',
      id,
    };
  }

  private async toNodeReadable(
    body: NonNullable<
      Awaited<ReturnType<StorageService['getFile']>>['Body']
    >,
  ): Promise<Readable> {
    if (body instanceof Readable) {
      return body;
    }

    if (
      typeof (body as { transformToWebStream?: () => unknown })
        .transformToWebStream === 'function'
    ) {
      return Readable.fromWeb(
        (
          body as {
            transformToWebStream: () => import('node:stream/web').ReadableStream;
          }
        ).transformToWebStream(),
      );
    }

    throw new InternalServerErrorException('Unsupported storage stream type');
  }
}
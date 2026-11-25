import { Document as DocumentEntity } from '../entities/document.entity';

export function toPublicDocument(document: DocumentEntity) {
  return {
    id: document.id,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: Number(document.size),
    scanStatus: document.scanStatus,
    uploadedBy: document.uploadedBy,
    currentVersionNumber: document.currentVersionNumber,
    checksumSha256: document.checksumSha256,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
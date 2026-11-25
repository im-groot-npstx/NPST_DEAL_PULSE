export const DOCUMENT_ENTITY_TYPES = [
  'LEAD',
  'PROPOSAL',
  'BANK',
  'PROJECT',
  'APPROVAL',
  'CONTRACT',
] as const;

export type DocumentEntityType = (typeof DOCUMENT_ENTITY_TYPES)[number];

export interface DocumentClientOptions {
  /** Base URL including API prefix, e.g. http://localhost:3005/api/v1 */
  baseUrl: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Optional bearer token for future auth support */
  bearerToken?: string;
  /** Custom fetch implementation (defaults to global fetch) */
  fetch?: typeof fetch;
  /** Extra headers on every request */
  defaultHeaders?: Record<string, string>;
}

export interface UploadFileInput {
  /** File bytes */
  data: Buffer | Uint8Array | ArrayBuffer;
  /** Original filename sent to the API */
  filename: string;
  /** Declared MIME type (recommended) */
  mimeType?: string;
}

export interface DocumentRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  scanStatus: string;
  uploadedBy: string | null;
  currentVersionNumber: number;
  checksumSha256: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentResponse {
  message: string;
  documentId: string;
  originalName: string;
  size: number;
  mimeType: string;
  scanStatus: string;
  currentVersionNumber: number;
  versionId: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedDocuments {
  items: DocumentRecord[];
  meta: PaginationMeta;
}

export interface ListDocumentsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'originalName' | 'size';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateDocumentMetadataInput {
  originalName?: string;
  uploadedBy?: string;
}

export interface UpdateDocumentMetadataResponse {
  message: string;
  document: DocumentRecord;
}

export interface DeleteDocumentResponse {
  message: string;
  id: string;
}

export interface DownloadedFile {
  data: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

export interface AttachDocumentInput {
  entityType: DocumentEntityType;
  entityId: string;
  relationshipType?: string;
}

export interface DocumentAttachmentRecord {
  id: string;
  documentId: string;
  entityType: string;
  entityId: string;
  relationshipType: string;
  createdAt: string;
}

export interface AttachDocumentResponse {
  message: string;
  attachment: DocumentAttachmentRecord;
}

export interface DetachDocumentResponse {
  message: string;
  attachmentId: string;
  documentId: string;
}

export interface ListEntityDocumentsQuery {
  entityType: DocumentEntityType;
  entityId: string;
  relationshipType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'originalName' | 'size';
  sortOrder?: 'ASC' | 'DESC';
}

export interface EntityDocumentItem {
  attachmentId: string;
  relationshipType: string;
  attachedAt: string;
  document: DocumentRecord;
}

export interface EntityDocumentsResponse {
  entityType: string;
  entityId: string;
  items: EntityDocumentItem[];
  meta: PaginationMeta;
}

export interface DocumentVersionItem {
  versionId: string;
  versionNumber: number;
  originalName: string;
  mimeType: string;
  size: number;
  scanStatus: string;
  checksumSha256: string;
  createdAt: string;
}

export interface DocumentVersionHistoryResponse {
  documentId: string;
  currentVersionNumber: number;
  items: DocumentVersionItem[];
}

export interface UploadVersionResponse {
  message: string;
  documentId: string;
  versionId: string;
  versionNumber: number;
  originalName: string;
  mimeType: string;
  size: number;
  scanStatus: string;
  createdAt: string;
}

export interface HealthResponse {
  service: string;
  status: string;
  timestamp: string;
}

export interface DeleteDocumentOptions {
  /** Pass true when the API should delete documents with multiple attachments */
  force?: boolean;
}
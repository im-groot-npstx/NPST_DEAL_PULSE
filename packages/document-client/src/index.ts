export { DocumentClient } from './document-client';
export {
  DocumentClientError,
  DocumentClientTimeoutError,
} from './errors';
export type { DocumentApiErrorBody } from './errors';
export type {
  AttachDocumentInput,
  AttachDocumentResponse,
  DeleteDocumentOptions,
  DeleteDocumentResponse,
  DocumentAttachmentRecord,
  DocumentClientOptions,
  DocumentEntityType,
  DocumentRecord,
  DocumentVersionHistoryResponse,
  DocumentVersionItem,
  DownloadedFile,
  EntityDocumentItem,
  EntityDocumentsResponse,
  HealthResponse,
  ListDocumentsQuery,
  ListEntityDocumentsQuery,
  PaginatedDocuments,
  PaginationMeta,
  UpdateDocumentMetadataInput,
  UpdateDocumentMetadataResponse,
  UploadDocumentResponse,
  UploadFileInput,
  UploadVersionResponse,
} from './types';
export { DOCUMENT_ENTITY_TYPES } from './types';
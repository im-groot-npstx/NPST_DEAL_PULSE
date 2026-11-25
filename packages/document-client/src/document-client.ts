import { HttpTransport } from './http';
import {
  AttachDocumentInput,
  AttachDocumentResponse,
  DeleteDocumentOptions,
  DeleteDocumentResponse,
  DocumentClientOptions,
  DocumentVersionHistoryResponse,
  DownloadedFile,
  EntityDocumentsResponse,
  HealthResponse,
  ListDocumentsQuery,
  ListEntityDocumentsQuery,
  PaginatedDocuments,
  DetachDocumentResponse,
  DocumentAttachmentRecord,
  DocumentRecord,
  UpdateDocumentMetadataInput,
  UpdateDocumentMetadataResponse,
  UploadDocumentResponse,
  UploadFileInput,
  UploadVersionResponse,
} from './types';
import {
  buildMultipartBody,
  parseDownloadResponse,
  toBuffer,
} from './utils';

export class DocumentClient {
  private readonly http: HttpTransport;
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly bearerToken?: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: DocumentClientOptions) {
    if (!options?.baseUrl) {
      throw new Error('DocumentClient requires baseUrl');
    }
    this.http = new HttpTransport(options);
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.bearerToken = options.bearerToken;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  health(): Promise<HealthResponse> {
    return this.http.request({ method: 'GET', path: '/health' });
  }

  async upload(file: UploadFileInput): Promise<UploadDocumentResponse> {
    const payload = toBuffer(file.data);
    const { body } = buildMultipartBody({
      data: payload,
      filename: file.filename,
      mimeType: file.mimeType,
    });
    return this.multipartRequest<UploadDocumentResponse>('POST', '/uploads', body);
  }

  getDocument(documentId: string): Promise<DocumentRecord> {
    return this.http.request({
      method: 'GET',
      path: `/documents/${documentId}`,
    });
  }

  /** Paginated document listing (search/sort via query parameters). */
  listDocuments(query: ListDocumentsQuery = {}): Promise<PaginatedDocuments> {
    return this.http.request({
      method: 'GET',
      path: '/documents',
      query: {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    });
  }

  updateMetadata(
    documentId: string,
    input: UpdateDocumentMetadataInput,
  ): Promise<UpdateDocumentMetadataResponse> {
    return this.http.request({
      method: 'PATCH',
      path: `/documents/${documentId}`,
      json: input,
    });
  }

  deleteDocument(
    documentId: string,
    options?: DeleteDocumentOptions,
  ): Promise<DeleteDocumentResponse> {
    return this.http.request({
      method: 'DELETE',
      path: `/documents/${documentId}`,
      query: { force: options?.force ? 'true' : undefined },
    });
  }

  async downloadCurrentVersion(documentId: string): Promise<DownloadedFile> {
    return this.downloadFromPath(
      `/documents/${documentId}/download`,
      `document-${documentId}`,
    );
  }

  async downloadVersion(
    documentId: string,
    versionNumber: number,
  ): Promise<DownloadedFile> {
    return this.downloadFromPath(
      `/documents/${documentId}/versions/${versionNumber}/download`,
      `document-${documentId}-v${versionNumber}`,
    );
  }

  async uploadVersion(
    documentId: string,
    file: UploadFileInput,
  ): Promise<UploadVersionResponse> {
    const payload = toBuffer(file.data);
    const { body } = buildMultipartBody({
      data: payload,
      filename: file.filename,
      mimeType: file.mimeType,
    });
    return this.multipartRequest<UploadVersionResponse>(
      'POST',
      `/documents/${documentId}/versions`,
      body,
    );
  }

  listVersions(documentId: string): Promise<DocumentVersionHistoryResponse> {
    return this.http.request({
      method: 'GET',
      path: `/documents/${documentId}/versions`,
    });
  }

  attach(
    documentId: string,
    input: AttachDocumentInput,
  ): Promise<AttachDocumentResponse> {
    return this.http.request({
      method: 'POST',
      path: `/documents/${documentId}/attachments`,
      json: {
        entityType: input.entityType,
        entityId: input.entityId,
        relationshipType: input.relationshipType ?? 'ATTACHMENT',
      },
    });
  }

  listAttachments(documentId: string): Promise<DocumentAttachmentRecord[]> {
    return this.http.request({
      method: 'GET',
      path: `/documents/${documentId}/attachments`,
    });
  }

  detach(
    documentId: string,
    attachmentId: string,
  ): Promise<DetachDocumentResponse> {
    return this.http.request({
      method: 'DELETE',
      path: `/documents/${documentId}/attachments/${attachmentId}`,
    });
  }

  /** Fetch documents linked to a CRM entity (Lead, Proposal, etc.). */
  listEntityDocuments(
    query: ListEntityDocumentsQuery,
  ): Promise<EntityDocumentsResponse> {
    return this.http.request({
      method: 'GET',
      path: '/entity-documents',
      query: {
        entityType: query.entityType,
        entityId: query.entityId,
        relationshipType: query.relationshipType,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    });
  }

  private async downloadFromPath(
    path: string,
    fallbackFilename: string,
  ): Promise<DownloadedFile> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const headers: Record<string, string> = { ...this.defaultHeaders };
    if (this.bearerToken) {
      headers.Authorization = `Bearer ${this.bearerToken}`;
    }

    try {
      const response = await this.fetchImpl(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      if (!response.ok) {
        const { DocumentClientError } = await import('./errors');
        throw new DocumentClientError({
          message: `HTTP ${response.status} while downloading ${url}`,
          statusCode: response.status,
          url,
          method: 'GET',
        });
      }
      return parseDownloadResponse(response, fallbackFilename);
    } finally {
      clearTimeout(timer);
    }
  }

  private async multipartRequest<T>(
    method: 'POST',
    path: string,
    body: FormData,
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const headers: Record<string, string> = { ...this.defaultHeaders };
    if (this.bearerToken) {
      headers.Authorization = `Bearer ${this.bearerToken}`;
    }

    try {
      const response = await this.fetchImpl(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type') ?? '';
        let errorBody: import('./errors').DocumentApiErrorBody | undefined;
        if (contentType.includes('application/json')) {
          errorBody = (await response.json()) as import('./errors').DocumentApiErrorBody;
        }
        const { DocumentClientError } = await import('./errors');
        throw new DocumentClientError({
          message:
            (typeof errorBody?.message === 'string' && errorBody.message) ||
            `HTTP ${response.status} for ${method} ${url}`,
          statusCode: response.status,
          body: errorBody,
          url,
          method,
        });
      }
      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
export interface DocumentApiErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string;
  documentId?: string;
  versionNumber?: number;
}

export class DocumentClientError extends Error {
  readonly statusCode: number;
  readonly body: DocumentApiErrorBody | undefined;
  readonly url: string;
  readonly method: string;

  constructor(params: {
    message: string;
    statusCode: number;
    body?: DocumentApiErrorBody;
    url: string;
    method: string;
  }) {
    super(params.message);
    this.name = 'DocumentClientError';
    this.statusCode = params.statusCode;
    this.body = params.body;
    this.url = params.url;
    this.method = params.method;
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isDuplicate(): boolean {
    return this.statusCode === 409;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }
}

export class DocumentClientTimeoutError extends Error {
  readonly url: string;
  readonly timeoutMs: number;

  constructor(url: string, timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms: ${url}`);
    this.name = 'DocumentClientTimeoutError';
    this.url = url;
    this.timeoutMs = timeoutMs;
  }
}
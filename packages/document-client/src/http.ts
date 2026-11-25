import {
  DocumentApiErrorBody,
  DocumentClientError,
  DocumentClientTimeoutError,
} from './errors';
import { DocumentClientOptions } from './types';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  json?: unknown;
  body?: BodyInit;
  headers?: Record<string, string>;
  responseType?: 'json' | 'binary';
}

export class HttpTransport {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly bearerToken?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: DocumentClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.bearerToken = options.bearerToken;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (this.bearerToken) {
      headers.Authorization = `Bearer ${this.bearerToken}`;
    }

    if (options.json !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers,
        body:
          options.body ??
          (options.json !== undefined ? JSON.stringify(options.json) : undefined),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await this.parseErrorBody(response);
        throw new DocumentClientError({
          message:
            this.formatErrorMessage(errorBody) ??
            `HTTP ${response.status} for ${options.method} ${url}`,
          statusCode: response.status,
          body: errorBody,
          url,
          method: options.method,
        });
      }

      if (options.responseType === 'binary') {
        return (await response.arrayBuffer()) as T;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        return text as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof DocumentClientError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new DocumentClientTimeoutError(url, this.timeoutMs);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async parseErrorBody(
    response: Response,
  ): Promise<DocumentApiErrorBody | undefined> {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return undefined;
    }
    try {
      return (await response.json()) as DocumentApiErrorBody;
    } catch {
      return undefined;
    }
  }

  private formatErrorMessage(body?: DocumentApiErrorBody): string | undefined {
    if (!body?.message) {
      return body?.error;
    }
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    return body.message;
  }
}
import { DocumentClient } from './document-client';
import { DocumentClientError } from './errors';

describe('DocumentClient', () => {
  const baseUrl = 'http://localhost:3005/api/v1';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requires baseUrl', () => {
    expect(() => new DocumentClient({ baseUrl: '' })).toThrow(
      'DocumentClient requires baseUrl',
    );
  });

  it('uploads via multipart POST', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        message: 'File uploaded successfully',
        documentId: 'doc-1',
        originalName: 'notes.txt',
        size: 5,
        mimeType: 'text/plain',
        scanStatus: 'CLEAN',
        currentVersionNumber: 1,
        versionId: 'ver-1',
        createdAt: '2026-11-20T00:00:00.000Z',
      }),
    });

    const client = new DocumentClient({ baseUrl, fetch: mockFetch });
    const result = await client.upload({
      data: Buffer.from('hello'),
      filename: 'notes.txt',
      mimeType: 'text/plain',
    });

    expect(result.documentId).toBe('doc-1');
    expect(mockFetch).toHaveBeenCalledWith(
      `${baseUrl}/uploads`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('lists entity documents with query params', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        entityType: 'LEAD',
        entityId: 'lead-1',
        items: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
      }),
    });

    const client = new DocumentClient({ baseUrl, fetch: mockFetch });
    await client.listEntityDocuments({
      entityType: 'LEAD',
      entityId: 'lead-1',
      page: 1,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseUrl}/entity-documents?entityType=LEAD&entityId=lead-1&page=1`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('maps API failures to DocumentClientError', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Document not found', statusCode: 404 }),
    });

    const client = new DocumentClient({ baseUrl, fetch: mockFetch });
    await expect(client.getDocument('missing')).rejects.toBeInstanceOf(
      DocumentClientError,
    );
  });
});
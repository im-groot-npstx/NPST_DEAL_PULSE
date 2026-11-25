import { DownloadedFile } from './types';

export function toBuffer(data: Buffer | Uint8Array | ArrayBuffer): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }
  return Buffer.from(new Uint8Array(data));
}

export function parseFilenameFromContentDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) {
    return fallback;
  }
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }
  const basicMatch = header.match(/filename="([^"]+)"/i);
  if (basicMatch?.[1]) {
    return basicMatch[1];
  }
  return fallback;
}

export function buildMultipartBody(
  file: { data: Buffer; filename: string; mimeType?: string },
): { body: FormData; headers: Record<string, string> } {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(file.data) as BlobPart], {
    type: file.mimeType ?? 'application/octet-stream',
  });
  form.append('file', blob, file.filename);
  return { body: form, headers: {} };
}

export async function parseDownloadResponse(
  response: Response,
  fallbackName: string,
): Promise<DownloadedFile> {
  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') ?? 'application/octet-stream';
  const filename = parseFilenameFromContentDisposition(
    response.headers.get('content-disposition'),
    fallbackName,
  );
  const sizeHeader = response.headers.get('content-length');
  const size = sizeHeader ? Number(sizeHeader) : buffer.length;

  return { data: buffer, filename, mimeType, size };
}
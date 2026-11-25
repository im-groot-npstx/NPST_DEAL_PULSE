import {
  parseFilenameFromContentDisposition,
  toBuffer,
} from './utils';

describe('utils', () => {
  it('converts Uint8Array to Buffer', () => {
    const bytes = new Uint8Array([1, 2, 3]);
    expect(toBuffer(bytes)).toEqual(Buffer.from([1, 2, 3]));
  });

  it('parses RFC 5987 filename', () => {
    const header =
      "attachment; filename*=UTF-8''proposal%20v2.pdf; filename=\"fallback.pdf\"";
    expect(parseFilenameFromContentDisposition(header, 'fallback.pdf')).toBe(
      'proposal v2.pdf',
    );
  });
});
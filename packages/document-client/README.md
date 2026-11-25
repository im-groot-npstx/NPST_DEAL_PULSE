# @dealplus/document-client

TypeScript SDK for the DealPlus **Document Service**. Other CRM services use this package to upload, download, version, and attach documents **without** direct MinIO or MySQL access.

## Installation

### From GitHub Packages (private org)

1. Create a GitHub PAT with `read:packages` (and `write:packages` for publishers).
2. Configure npm (do not commit tokens):

```bash
cp .npmrc.example .npmrc
# Set NODE_AUTH_TOKEN in your environment, then:
npm config set @dealplus:registry https://npm.pkg.github.com
```

3. Install:

```bash
npm install @dealplus/document-client
```

### Monorepo (local path)

```bash
npm install ../packages/document-client
```

## Configuration

```typescript
import { DocumentClient } from '@dealplus/document-client';

const client = new DocumentClient({
  baseUrl: process.env.DOCUMENT_SERVICE_URL ?? 'http://localhost:3005/api/v1',
  timeoutMs: 30_000,
  bearerToken: process.env.DOCUMENT_SERVICE_TOKEN, // optional, for future auth
});
```

## Usage

### Upload

```typescript
import { readFile } from 'node:fs/promises';

const file = await readFile('./proposal.pdf');
const uploaded = await client.upload({
  data: file,
  filename: 'proposal.pdf',
  mimeType: 'application/pdf',
});
console.log(uploaded.documentId);
```

### Attach to Lead

```typescript
await client.attach(uploaded.documentId, {
  entityType: 'LEAD',
  entityId: leadId,
  relationshipType: 'RFP',
});
```

### List documents for an entity

```typescript
const page = await client.listEntityDocuments({
  entityType: 'LEAD',
  entityId: leadId,
  page: 1,
  limit: 20,
});
```

### Download current / specific version

```typescript
const current = await client.downloadCurrentVersion(documentId);
const v2 = await client.downloadVersion(documentId, 2);
```

### Metadata, list, delete

```typescript
await client.updateMetadata(documentId, { uploadedBy: userId });
const doc = await client.getDocument(documentId);
const all = await client.listDocuments({ page: 1, sortBy: 'createdAt' });
await client.deleteDocument(documentId, { force: true });
```

### Version history

```typescript
const history = await client.listVersions(documentId);
const next = await client.uploadVersion(documentId, {
  data: updatedBytes,
  filename: 'proposal-v2.pdf',
  mimeType: 'application/pdf',
});
```

## NestJS integration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocumentClientModule, DocumentClientService } from '@dealplus/document-client/nest';

@Module({
  imports: [
    DocumentClientModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseUrl: config.getOrThrow('DOCUMENT_SERVICE_URL'),
        timeoutMs: 30_000,
      }),
    }),
  ],
})
export class LeadModule {}

@Injectable()
export class LeadDocumentsService {
  constructor(private readonly documents: DocumentClientService) {}
}
```

## Error handling

```typescript
import { DocumentClientError, DocumentClientTimeoutError } from '@dealplus/document-client';

try {
  await client.upload(file);
} catch (error) {
  if (error instanceof DocumentClientError) {
    if (error.isDuplicate) {
      // HTTP 409 duplicate checksum / attachment
    }
    if (error.isNotFound) {
      // HTTP 404
    }
  }
  if (error instanceof DocumentClientTimeoutError) {
    // retry with backoff
  }
}
```

## API coverage

| Feature | SDK method |
|---------|------------|
| Health | `health()` |
| Upload | `upload()` |
| Get metadata | `getDocument()` |
| List / search | `listDocuments()`, `listEntityDocuments()` |
| Update metadata | `updateMetadata()` |
| Delete | `deleteDocument()` |
| Download current | `downloadCurrentVersion()` |
| Version upload | `uploadVersion()` |
| Version history | `listVersions()` |
| Version download | `downloadVersion()` |
| Attach / detach | `attach()`, `detach()`, `listAttachments()` |

**Not implemented on the server (no SDK method):** version restoration.

## Development

```bash
cd packages/document-client
npm install
npm run build
npm test
```

## Versioning

This package follows [Semantic Versioning](https://semver.org/). Release tags: `document-client-v*`.

## Publishing

See repository workflow `.github/workflows/document-client-release.yml`. Publishing is manual/tag-driven and requires `NODE_AUTH_TOKEN` in GitHub Actions secrets (not committed to the repo).
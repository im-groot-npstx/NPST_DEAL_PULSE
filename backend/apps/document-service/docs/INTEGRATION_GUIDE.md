# Document Service Integration Guide

## 1. Overview

The Document Service (`document-service`) is the shared file capability for DealPlus CRM. It owns:

- File validation and antivirus scanning (ClamAV)
- Object storage (MinIO, S3-compatible API)
- Document metadata and versioning (MySQL via TypeORM)
- Generic CRM entity attachments (Lead, Proposal, Bank, Project, Approval, Contract)

Consuming services **must not** access the Document Service database or MinIO directly. Use the REST APIs below.

## 2. Base URL

| Environment | Base URL |
|-------------|----------|
| Local | `http://localhost:3005/api/v1` |
| Deployed | Configure per environment (API gateway or direct service URL) |

Swagger UI (local): `http://localhost:3005/api/docs`

## 3. API Endpoints (implemented)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| POST | `/uploads` | Upload a new document (creates version 1) |
| GET | `/documents` | Paginated document list |
| GET | `/documents/:id` | Document metadata |
| PATCH | `/documents/:id` | Update editable metadata |
| DELETE | `/documents/:id` | Delete document and all versions |
| GET | `/documents/:id/download` | Download current version |
| POST | `/documents/:documentId/versions` | Upload new version |
| GET | `/documents/:documentId/versions` | Version history |
| GET | `/documents/:documentId/versions/:versionNumber/download` | Download specific version |
| POST | `/documents/:documentId/attachments` | Attach document to CRM entity |
| GET | `/documents/:documentId/attachments` | List attachments for a document |
| DELETE | `/documents/:documentId/attachments/:attachmentId` | Detach (does not delete file) |
| GET | `/entity-documents` | List documents for a CRM entity |

### Common errors

| Status | Meaning |
|--------|---------|
| 400 | Validation failure, malware, MIME/extension mismatch |
| 404 | Document, version, attachment, or storage object not found |
| 409 | Duplicate file content or duplicate attachment |
| 500 / 503 | Persistence, storage, or antivirus infrastructure failure |

Internal details (`storageKey`, stack traces) are not returned to clients.

## 4. Upload integration

```http
POST /api/v1/uploads
Content-Type: multipart/form-data
```

Form field: `file` (binary)

**Example response (201):**

```json
{
  "message": "File uploaded successfully",
  "documentId": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "proposal.pdf",
  "size": 120044,
  "mimeType": "application/pdf",
  "scanStatus": "CLEAN",
  "currentVersionNumber": 1,
  "versionId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "createdAt": "2026-11-20T12:00:00.000Z"
}
```

**Note:** `storageKey` is intentionally omitted from API responses.

## 5. Attach document to entity

```http
POST /api/v1/documents/{documentId}/attachments
Content-Type: application/json
```

```json
{
  "entityType": "LEAD",
  "entityId": "lead-uuid",
  "relationshipType": "RFP"
}
```

Supported `entityType` values: `LEAD`, `PROPOSAL`, `BANK`, `PROJECT`, `APPROVAL`, `CONTRACT`.

## 6. Fetch documents by entity

```http
GET /api/v1/entity-documents?entityType=LEAD&entityId=lead-uuid&page=1&limit=20
```

Optional: `relationshipType`, `sortBy`, `sortOrder`.

Proposal example:

```http
GET /api/v1/entity-documents?entityType=PROPOSAL&entityId=proposal-uuid
```

## 7. Download integration

Download via Document Service only:

```http
GET /api/v1/documents/{documentId}/download
GET /api/v1/documents/{documentId}/versions/{versionNumber}/download
```

Returns the file stream with `Content-Disposition: attachment`.

## 8. Versioning

| Concept | Description |
|---------|-------------|
| Document ID | Stable logical identifier (`documents.id`) |
| Version ID | Row in `document_versions` |
| Current version | `currentVersionNumber` on the document |
| New version | `POST /documents/:id/versions` with multipart `file` |
| History | `GET /documents/:id/versions` |

Versions are immutable; each upload creates a new MinIO object key.

## 9. Metadata

| Field | Client editable |
|-------|-----------------|
| `originalName` | Yes (`PATCH /documents/:id`) |
| `uploadedBy` | Yes |
| `mimeType`, `size`, `scanStatus`, `checksumSha256`, `currentVersionNumber` | No (system-managed) |

## 10. Official TypeScript SDK

Use **`@dealplus/document-client`** from `packages/document-client` in this monorepo (publishable to GitHub Packages). It wraps the REST APIs below with typed methods and optional NestJS module integration. See `packages/document-client/README.md`.

## 11. NestJS consumer example (HttpService)

```typescript
import { HttpService } from '@nestjs/axios';
import FormData from 'form-data';

async function uploadLeadDocument(http: HttpService, file: Buffer, fileName: string) {
  const form = new FormData();
  form.append('file', file, fileName);
  const upload = await http.axiosRef.post(
    `${process.env.DOCUMENT_SERVICE_URL}/uploads`,
    form,
    { headers: form.getHeaders() },
  );
  const documentId = upload.data.documentId;
  await http.axiosRef.post(
    `${process.env.DOCUMENT_SERVICE_URL}/documents/${documentId}/attachments`,
    { entityType: 'LEAD', entityId: 'lead-uuid', relationshipType: 'RFP' },
  );
  return upload.data;
}
```

## 12. Error handling

- Retry **503** for storage/ClamAV outages with backoff.
- Treat **409** duplicate content as idempotent hint (`documentId` in body).
- Do not retry **400** validation errors.

## 13. Authentication

Swagger shows Bearer auth, but **no authentication guard is enforced yet**. Network-level protection (API gateway, mTLS, private VPC) is required until auth is implemented.

## 14. Configuration

**Document Service** (`.env`):

- `DB_*`, `DB_SSL_CA` — MySQL
- `MINIO_*`, `MINIO_BUCKET`
- `CLAMAV_HOST`, `CLAMAV_PORT`
- `DOCUMENT_MAX_UPLOAD_BYTES`, `DOCUMENT_ALLOWED_EXTENSIONS`, `DOCUMENT_ALLOWED_MIME_TYPES`

**Consumers:**

- `DOCUMENT_SERVICE_URL` (e.g. `http://localhost:3005/api/v1`)

## Database migrations (manual)

After pulling schema changes:

```bash
cd backend
npm run migration:show
npm run migration:run
```

New migration: `1795201000000-DocumentVersionsAndAttachments.ts` (versions, attachments, backfill).
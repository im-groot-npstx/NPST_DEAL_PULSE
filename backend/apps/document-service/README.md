# Document Service

Shared document capability for DealPlus CRM: upload validation, ClamAV scanning, MinIO storage, MySQL metadata, generic entity attachments, and versioning.

- **Port:** `3005`
- **API prefix:** `/api/v1`
- **Swagger:** `/api/docs`
- **Integration guide:** `docs/INTEGRATION_GUIDE.md`

## Run locally

```bash
cd backend
docker compose -f docker-compose.document-service.yml up -d
npm run migration:run
npm run start:documents
```

## Migrations

Migrations are managed by TypeORM (`synchronize: false`). Use:

```bash
npm run migration:show
npm run migration:run
npm run migration:revert
```
# lead-service

DealPulse Lead microservice (NestJS) — CRUD, qualification, history, lifecycle, TypeORM migrations.

## Local setup

1. Configure `backend/.env` for `dealplus_lead_db` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL_CA`).
2. Review and apply migrations (non-destructive `CREATE` only in initial migration):
   - `npm run migration:lead:show` (from `backend/`)
   - `npm run migration:lead:run` when ready
3. Start: `npm run start:leads` (from `backend/`)
4. Swagger: http://localhost:3002/api/docs

## Auth integration

`libs/security` is not wired yet. Send actor id via header `x-changed-by` for audit/history. Bearer auth in Swagger is prepared for future JWT integration.

## Manual API testing

- Swagger UI, or Postman with base URL `http://localhost:3002/api/v1`
- Example headers: `Content-Type: application/json`, `x-changed-by: <user-id>`

## Tests

```bash
cd backend && npm run test:leads
```

Uses mocked repositories — does not touch production data.
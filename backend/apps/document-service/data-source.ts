import 'dotenv/config';

import { readFileSync } from 'fs';
import { resolve } from 'path';

import { DataSource } from 'typeorm';

import { Document } from './src/entities/document.entity';
import { DocumentAttachment } from './src/entities/document-attachment.entity';
import { DocumentVersion } from './src/entities/document-version.entity';

const sslCaPath = process.env.DB_SSL_CA
  ? resolve(process.cwd(), process.env.DB_SSL_CA)
  : undefined;

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 16659),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Document, DocumentVersion, DocumentAttachment],
  migrations: [resolve(__dirname, 'src/migrations/*.{ts,js}')],
  synchronize: false,
  ssl: sslCaPath
  ? {
      ca: readFileSync(sslCaPath),
      rejectUnauthorized: true,
    }
  : undefined,
});
 
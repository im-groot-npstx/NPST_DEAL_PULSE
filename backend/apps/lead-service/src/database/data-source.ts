import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { LeadHistory } from '../entities/lead-history.entity';
import { LeadQualification } from '../entities/lead-qualification.entity';

loadEnv({ path: resolve(process.cwd(), '.env') });

const sslCaPath = resolve(
  process.cwd(),
  process.env.DB_SSL_CA ?? './ca.pem',
);

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 16659),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Lead, LeadQualification, LeadHistory],
  migrations: [
    resolve(
      __dirname,
      __filename.endsWith('.js') ? 'migrations/*.js' : 'migrations/*.ts',
    ),
  ],
  synchronize: false,
  ssl: {
    ca: readFileSync(sslCaPath),
    rejectUnauthorized: true,
  },
  migrationsTableName: 'lead_migrations',
});
import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentVersionsAndAttachments1795201000000
  implements MigrationInterface
{
  name = 'DocumentVersionsAndAttachments1795201000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`documents\` ADD \`currentVersionNumber\` int NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`documents\` ADD \`checksumSha256\` varchar(64) NULL`,
    );

    await queryRunner.query(
      `CREATE TABLE \`document_versions\` (\`id\` varchar(36) NOT NULL, \`documentId\` varchar(36) NOT NULL, \`versionNumber\` int NOT NULL, \`storageKey\` varchar(500) NOT NULL, \`originalName\` varchar(255) NOT NULL, \`mimeType\` varchar(100) NOT NULL, \`size\` bigint NOT NULL, \`checksumSha256\` varchar(64) NOT NULL, \`scanStatus\` varchar(20) NOT NULL DEFAULT 'CLEAN', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_dv_document_id\` (\`documentId\`), UNIQUE INDEX \`IDX_dv_storage_key\` (\`storageKey\`), UNIQUE INDEX \`UQ_dv_document_version\` (\`documentId\`, \`versionNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`document_attachments\` (\`id\` varchar(36) NOT NULL, \`documentId\` varchar(36) NOT NULL, \`entityType\` varchar(50) NOT NULL, \`entityId\` varchar(100) NOT NULL, \`relationshipType\` varchar(50) NOT NULL DEFAULT 'ATTACHMENT', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_da_entity\` (\`entityType\`, \`entityId\`), INDEX \`IDX_da_document_id\` (\`documentId\`), UNIQUE INDEX \`UQ_da_link\` (\`documentId\`, \`entityType\`, \`entityId\`, \`relationshipType\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `ALTER TABLE \`document_versions\` ADD CONSTRAINT \`FK_dv_document\` FOREIGN KEY (\`documentId\`) REFERENCES \`documents\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`document_attachments\` ADD CONSTRAINT \`FK_da_document\` FOREIGN KEY (\`documentId\`) REFERENCES \`documents\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
      INSERT INTO \`document_versions\` (
        \`id\`,
        \`documentId\`,
        \`versionNumber\`,
        \`storageKey\`,
        \`originalName\`,
        \`mimeType\`,
        \`size\`,
        \`checksumSha256\`,
        \`scanStatus\`,
        \`createdAt\`
      )
      SELECT
        UUID(),
        \`id\`,
        1,
        \`storageKey\`,
        \`originalName\`,
        \`mimeType\`,
        \`size\`,
        COALESCE(\`checksumSha256\`, ''),
        \`scanStatus\`,
        \`createdAt\`
      FROM \`documents\`
    `);

    await queryRunner.query(`
      INSERT INTO \`document_attachments\` (
        \`id\`,
        \`documentId\`,
        \`entityType\`,
        \`entityId\`,
        \`relationshipType\`,
        \`createdAt\`
      )
      SELECT
        UUID(),
        \`id\`,
        'LEAD',
        \`leadId\`,
        'LEGACY',
        \`createdAt\`
      FROM \`documents\`
      WHERE \`leadId\` IS NOT NULL AND \`leadId\` <> ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`document_attachments\` DROP FOREIGN KEY \`FK_da_document\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`document_versions\` DROP FOREIGN KEY \`FK_dv_document\``,
    );
    await queryRunner.query(`DROP TABLE \`document_attachments\``);
    await queryRunner.query(`DROP TABLE \`document_versions\``);
    await queryRunner.query(
      `ALTER TABLE \`documents\` DROP COLUMN \`checksumSha256\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`documents\` DROP COLUMN \`currentVersionNumber\``,
    );
  }
}
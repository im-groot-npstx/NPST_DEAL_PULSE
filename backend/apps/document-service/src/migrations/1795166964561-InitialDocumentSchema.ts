import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDocumentSchema1795166964561 implements MigrationInterface {
    name = 'InitialDocumentSchema1795166964561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`documents\` (\`id\` varchar(36) NOT NULL, \`originalName\` varchar(255) NOT NULL, \`storageKey\` varchar(500) NOT NULL, \`mimeType\` varchar(100) NOT NULL, \`size\` bigint NOT NULL, \`scanStatus\` varchar(20) NOT NULL DEFAULT 'CLEAN', \`uploadedBy\` varchar(100) NULL, \`leadId\` varchar(100) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_4ac70d1d6a05529f57920c759b\` (\`leadId\`), UNIQUE INDEX \`IDX_55d892defb82e6d09776c4c29a\` (\`storageKey\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_55d892defb82e6d09776c4c29a\` ON \`documents\``);
        await queryRunner.query(`DROP INDEX \`IDX_4ac70d1d6a05529f57920c759b\` ON \`documents\``);
        await queryRunner.query(`DROP TABLE \`documents\``);
    }

}

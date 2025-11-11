import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedReportorBlockTables1762413917214 implements MigrationInterface {
    name = 'AddedReportorBlockTables1762413917214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Events" ADD "timeZone" character varying(100) NOT NULL DEFAULT 'UTC'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Events" DROP COLUMN "timeZone"`);
    }

}

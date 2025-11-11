import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedReportorBlockTables1762848687060 implements MigrationInterface {
    name = 'AddedReportorBlockTables1762848687060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Producers" ADD "profileViews" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Producers" DROP COLUMN "profileViews"`);
    }

}

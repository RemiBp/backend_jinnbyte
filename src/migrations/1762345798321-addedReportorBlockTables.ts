import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedReportorBlockTables1762345798321 implements MigrationInterface {
    name = 'AddedReportorBlockTables1762345798321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "EventBookings" DROP COLUMN "isCancelled"`);
        await queryRunner.query(`ALTER TABLE "EventBookings" DROP COLUMN "isCheckedIn"`);
        await queryRunner.query(`CREATE TYPE "public"."EventBookings_status_enum" AS ENUM('scheduled', 'inProgress', 'completed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "EventBookings" ADD "status" "public"."EventBookings_status_enum" NOT NULL DEFAULT 'scheduled'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "EventBookings" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."EventBookings_status_enum"`);
        await queryRunner.query(`ALTER TABLE "EventBookings" ADD "isCheckedIn" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "EventBookings" ADD "isCancelled" boolean NOT NULL DEFAULT false`);
    }

}

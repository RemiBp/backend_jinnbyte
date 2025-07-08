import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1751631518771 implements MigrationInterface {
    name = 'InitailSetup1751631518771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "EventBookings" ADD "isCheckedIn" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "EventBookings" ADD "internalNotes" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "EventBookings" DROP COLUMN "internalNotes"`);
        await queryRunner.query(`ALTER TABLE "EventBookings" DROP COLUMN "isCheckedIn"`);
    }

}

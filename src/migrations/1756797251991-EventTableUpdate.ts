import { MigrationInterface, QueryRunner } from "typeorm";

export class EventTableUpdate1756797251991 implements MigrationInterface {
    name = 'EventTableUpdate1756797251991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "OperationalHour" DROP COLUMN "slotDuration"`);
        await queryRunner.query(`ALTER TABLE "Slot" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "Events" ADD "latitude" numeric(9,6)`);
        await queryRunner.query(`ALTER TABLE "Events" ADD "longitude" numeric(9,6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Events" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "Events" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "Slot" ADD "duration" integer`);
        await queryRunner.query(`ALTER TABLE "OperationalHour" ADD "slotDuration" integer DEFAULT '60'`);
    }

}

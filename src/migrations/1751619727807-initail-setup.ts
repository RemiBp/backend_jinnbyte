import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1751619727807 implements MigrationInterface {
    name = 'InitailSetup1751619727807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."Events_status_enum" RENAME TO "Events_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."Events_status_enum" AS ENUM('Draft', 'Active', 'Closed')`);
        await queryRunner.query(`ALTER TABLE "Events" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Events" ALTER COLUMN "status" TYPE "public"."Events_status_enum" USING "status"::"text"::"public"."Events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Events_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Events_status_enum_old" AS ENUM('DRAFT', 'ACTIVE', 'CLOSED')`);
        await queryRunner.query(`ALTER TABLE "Events" ALTER COLUMN "status" TYPE "public"."Events_status_enum_old" USING "status"::"text"::"public"."Events_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "Events" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
        await queryRunner.query(`DROP TYPE "public"."Events_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."Events_status_enum_old" RENAME TO "Events_status_enum"`);
    }

}

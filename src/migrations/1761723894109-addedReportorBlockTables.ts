import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedReportorBlockTables1761723894109 implements MigrationInterface {
    name = 'AddedReportorBlockTables1761723894109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Interest" DROP CONSTRAINT "FK_0167ce6081d09215e54d2d61f08"`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" DROP COLUMN "suggestedSlotId"`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" DROP COLUMN "suggestedTime"`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" DROP COLUMN "respondedAt"`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" DROP COLUMN "declineReason"`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" DROP COLUMN "suggestedMessage"`);
        await queryRunner.query(`ALTER TABLE "Interest" DROP COLUMN "slotId"`);
        await queryRunner.query(`ALTER TYPE "public"."InterestInvite_status_enum" RENAME TO "InterestInvite_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."InterestInvite_status_enum" AS ENUM('Pending', 'Accepted', 'Declined')`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ALTER COLUMN "status" TYPE "public"."InterestInvite_status_enum" USING "status"::"text"::"public"."InterestInvite_status_enum"`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ALTER COLUMN "status" SET DEFAULT 'Pending'`);
        await queryRunner.query(`DROP TYPE "public"."InterestInvite_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."Interest_status_enum" RENAME TO "Interest_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."Interest_status_enum" AS ENUM('Pending', 'Confirmed', 'Declined', 'SuggestedNewTime')`);
        await queryRunner.query(`ALTER TABLE "Interest" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Interest" ALTER COLUMN "status" TYPE "public"."Interest_status_enum" USING "status"::"text"::"public"."Interest_status_enum"`);
        await queryRunner.query(`ALTER TABLE "Interest" ALTER COLUMN "status" SET DEFAULT 'Pending'`);
        await queryRunner.query(`DROP TYPE "public"."Interest_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."Producers_type_enum" RENAME TO "Producers_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."Producers_type_enum" AS ENUM('restaurant', 'leisure', 'wellness')`);
        await queryRunner.query(`ALTER TABLE "Producers" ALTER COLUMN "type" TYPE "public"."Producers_type_enum" USING "type"::"text"::"public"."Producers_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Producers_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."Producers_status_enum" RENAME TO "Producers_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."Producers_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "Producers" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Producers" ALTER COLUMN "status" TYPE "public"."Producers_status_enum" USING "status"::"text"::"public"."Producers_status_enum"`);
        await queryRunner.query(`ALTER TABLE "Producers" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."Producers_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Producers_status_enum_old" AS ENUM('pending', 'approved', 'rejected', 'claimed')`);
        await queryRunner.query(`ALTER TABLE "Producers" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Producers" ALTER COLUMN "status" TYPE "public"."Producers_status_enum_old" USING "status"::"text"::"public"."Producers_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "Producers" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."Producers_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."Producers_status_enum_old" RENAME TO "Producers_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."Producers_type_enum_old" AS ENUM('restaurant', 'leisure', 'wellness', 'all')`);
        await queryRunner.query(`ALTER TABLE "Producers" ALTER COLUMN "type" TYPE "public"."Producers_type_enum_old" USING "type"::"text"::"public"."Producers_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."Producers_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."Producers_type_enum_old" RENAME TO "Producers_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."Interest_status_enum_old" AS ENUM('Pending', 'Confirmed', 'Declined')`);
        await queryRunner.query(`ALTER TABLE "Interest" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Interest" ALTER COLUMN "status" TYPE "public"."Interest_status_enum_old" USING "status"::"text"::"public"."Interest_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "Interest" ALTER COLUMN "status" SET DEFAULT 'Pending'`);
        await queryRunner.query(`DROP TYPE "public"."Interest_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."Interest_status_enum_old" RENAME TO "Interest_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."InterestInvite_status_enum_old" AS ENUM('Pending', 'Accepted', 'Declined', 'SuggestedNewTime')`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ALTER COLUMN "status" TYPE "public"."InterestInvite_status_enum_old" USING "status"::"text"::"public"."InterestInvite_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ALTER COLUMN "status" SET DEFAULT 'Pending'`);
        await queryRunner.query(`DROP TYPE "public"."InterestInvite_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."InterestInvite_status_enum_old" RENAME TO "InterestInvite_status_enum"`);
        await queryRunner.query(`ALTER TABLE "Interest" ADD "slotId" integer`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ADD "suggestedMessage" text`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ADD "declineReason" text`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ADD "respondedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ADD "suggestedTime" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "InterestInvite" ADD "suggestedSlotId" integer`);
        await queryRunner.query(`ALTER TABLE "Interest" ADD CONSTRAINT "FK_0167ce6081d09215e54d2d61f08" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

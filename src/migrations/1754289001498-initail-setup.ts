import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1754289001498 implements MigrationInterface {
    name = 'InitailSetup1754289001498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Follows" ADD "followedUserId" integer`);
        await queryRunner.query(`ALTER TABLE "Follows" DROP CONSTRAINT "FK_c003ae3fbe100d9a2d8954f0b9f"`);
        await queryRunner.query(`ALTER TABLE "Follows" ALTER COLUMN "producerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Follows" ADD CONSTRAINT "FK_c003ae3fbe100d9a2d8954f0b9f" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Follows" ADD CONSTRAINT "FK_dcac1b098ffc0b31bc774b82d41" FOREIGN KEY ("followedUserId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Follows" DROP CONSTRAINT "FK_dcac1b098ffc0b31bc774b82d41"`);
        await queryRunner.query(`ALTER TABLE "Follows" DROP CONSTRAINT "FK_c003ae3fbe100d9a2d8954f0b9f"`);
        await queryRunner.query(`ALTER TABLE "Follows" ALTER COLUMN "producerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Follows" ADD CONSTRAINT "FK_c003ae3fbe100d9a2d8954f0b9f" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Follows" DROP COLUMN "followedUserId"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1754055104829 implements MigrationInterface {
    name = 'InitailSetup1754055104829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Follows" ("id" SERIAL NOT NULL, "followerId" integer NOT NULL, "producerId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_432518cf52923f5eae9e05d80f8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Follows" ADD CONSTRAINT "FK_e3acdcd1abcff906ce92f6b9a2b" FOREIGN KEY ("followerId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Follows" ADD CONSTRAINT "FK_c003ae3fbe100d9a2d8954f0b9f" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Follows" DROP CONSTRAINT "FK_c003ae3fbe100d9a2d8954f0b9f"`);
        await queryRunner.query(`ALTER TABLE "Follows" DROP CONSTRAINT "FK_e3acdcd1abcff906ce92f6b9a2b"`);
        await queryRunner.query(`DROP TABLE "Follows"`);
    }

}

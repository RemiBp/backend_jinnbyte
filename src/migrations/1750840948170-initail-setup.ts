import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1750840948170 implements MigrationInterface {
    name = 'InitailSetup1750840948170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "BusinessProfiles" ("id" SERIAL NOT NULL, "businessName" character varying NOT NULL, "userId" integer, CONSTRAINT "UQ_f9defb04ccb759b99b6a5cb2845" UNIQUE ("businessName"), CONSTRAINT "REL_1f2867a775dea1b1ed18a78678" UNIQUE ("userId"), CONSTRAINT "PK_3d7348ff6289c5869d4394eaa5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "BusinessProfiles" ADD CONSTRAINT "FK_1f2867a775dea1b1ed18a786780" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BusinessProfiles" DROP CONSTRAINT "FK_1f2867a775dea1b1ed18a786780"`);
        await queryRunner.query(`DROP TABLE "BusinessProfiles"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1751032801422 implements MigrationInterface {
    name = 'InitailSetup1751032801422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Events" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "date" character varying NOT NULL, "time" character varying NOT NULL, "location" character varying, "isActive" boolean NOT NULL DEFAULT true, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "producerId" integer, CONSTRAINT "PK_efc6f7ffffa26a4d4fe5f383a0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Events" ADD CONSTRAINT "FK_0f6c7be8f6ac9ccb3fc2c427564" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Events" DROP CONSTRAINT "FK_0f6c7be8f6ac9ccb3fc2c427564"`);
        await queryRunner.query(`DROP TABLE "Events"`);
    }

}

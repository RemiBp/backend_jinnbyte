import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedProfileViewLogs1762758561009 implements MigrationInterface {
    name = 'AddedProfileViewLogs1762758561009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ProfileViewLogs" ("id" SERIAL NOT NULL, "viewerId" integer NOT NULL, "producerId" integer NOT NULL, "date" date NOT NULL DEFAULT ('now'::text)::date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_877f35248d8a6e35f12a7ecb35b" UNIQUE ("viewerId", "producerId", "date"), CONSTRAINT "PK_d08f9ecf4caae23c13c56eaca88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ProfileViewLogs" ADD CONSTRAINT "FK_01da1682d21fd3a8bab15157ea4" FOREIGN KEY ("viewerId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION `);
        await queryRunner.query(`ALTER TABLE "ProfileViewLogs" ADD CONSTRAINT "FK_3b5d88fd6eb7cce16e66dac24e2" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ProfileViewLogs" DROP CONSTRAINT "FK_3b5d88fd6eb7cce16e66dac24e2"`);
        await queryRunner.query(`ALTER TABLE "ProfileViewLogs" DROP CONSTRAINT "FK_01da1682d21fd3a8bab15157ea4"`);
        await queryRunner.query(`DROP TABLE "ProfileViewLogs"`);
    }
}

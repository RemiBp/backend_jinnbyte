import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1750842192220 implements MigrationInterface {
    name = 'InitailSetup1750842192220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "phoneNumber" SET NOT NULL`);
    }

}

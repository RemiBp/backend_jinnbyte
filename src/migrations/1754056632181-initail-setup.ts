import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1754056632181 implements MigrationInterface {
    name = 'InitailSetup1754056632181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD "followingCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "Users" ADD "followersCount" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "followersCount"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "followingCount"`);
    }

}

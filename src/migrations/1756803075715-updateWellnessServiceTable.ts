import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWellnessServiceTable1756803075715 implements MigrationInterface {
    name = 'UpdateWellnessServiceTable1756803075715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "WellnessServices" DROP CONSTRAINT "FK_65930ea6c5ae4f38d78e61e0f77"`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" DROP CONSTRAINT "FK_55510973c0fcb0b3a3955303b9e"`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" ALTER COLUMN "wellnessId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" ALTER COLUMN "serviceTypeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" ADD CONSTRAINT "FK_65930ea6c5ae4f38d78e61e0f77" FOREIGN KEY ("wellnessId") REFERENCES "Wellness"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" ADD CONSTRAINT "FK_55510973c0fcb0b3a3955303b9e" FOREIGN KEY ("serviceTypeId") REFERENCES "WellnessServiceTypes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "WellnessServices" DROP CONSTRAINT "FK_55510973c0fcb0b3a3955303b9e"`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" DROP CONSTRAINT "FK_65930ea6c5ae4f38d78e61e0f77"`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" ALTER COLUMN "serviceTypeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" ALTER COLUMN "wellnessId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" ADD CONSTRAINT "FK_55510973c0fcb0b3a3955303b9e" FOREIGN KEY ("serviceTypeId") REFERENCES "WellnessServiceTypes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "WellnessServices" ADD CONSTRAINT "FK_65930ea6c5ae4f38d78e61e0f77" FOREIGN KEY ("wellnessId") REFERENCES "Wellness"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

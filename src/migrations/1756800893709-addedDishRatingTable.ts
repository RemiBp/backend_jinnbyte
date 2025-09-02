import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDishRatingTable1756800893709 implements MigrationInterface {
    name = 'AddedDishRatingTable1756800893709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "DishRatings" ("id" SERIAL NOT NULL, "rating" integer NOT NULL, "userId" integer NOT NULL, "dishId" integer NOT NULL, "postId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_25be861762438d72ec016071504" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "DishRatings" ADD CONSTRAINT "FK_cbfc0e948277275bf286967473a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DishRatings" ADD CONSTRAINT "FK_e07008ecd55aef51da74af6f051" FOREIGN KEY ("dishId") REFERENCES "MenuDishes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DishRatings" ADD CONSTRAINT "FK_4d111de6492552f437913bd4df5" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DishRatings" DROP CONSTRAINT "FK_4d111de6492552f437913bd4df5"`);
        await queryRunner.query(`ALTER TABLE "DishRatings" DROP CONSTRAINT "FK_e07008ecd55aef51da74af6f051"`);
        await queryRunner.query(`ALTER TABLE "DishRatings" DROP CONSTRAINT "FK_cbfc0e948277275bf286967473a"`);
        await queryRunner.query(`DROP TABLE "DishRatings"`);
    }

}

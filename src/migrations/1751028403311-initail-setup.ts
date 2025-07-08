import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailSetup1751028403311 implements MigrationInterface {
    name = 'InitailSetup1751028403311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Photos" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "source" character varying, "producerId" integer, CONSTRAINT "PK_60d73e2714a914f2cf23e026014" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "AIAnalyses" ("id" SERIAL NOT NULL, "careQuality" double precision, "cleanliness" double precision, "welcome" double precision, "valueForMoney" double precision, "atmosphere" double precision, "staffExpertise" double precision, "expectationRespect" double precision, "advice" double precision, "productsUsed" double precision, "pricing" double precision, "punctuality" double precision, "precision" double precision, "hygiene" double precision, "creativity" double precision, "durability" double precision, "painExperience" double precision, "averageScore" double precision, "producerId" integer, CONSTRAINT "REL_2fbe63f4f2bb25d82e85e59c44" UNIQUE ("producerId"), CONSTRAINT "PK_432bf1c0e3d07314ce805413bad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GlobalRatings" ("id" SERIAL NOT NULL, "service" double precision, "location" double precision, "portions" double precision, "ambiance" double precision, "aspects" jsonb, "emotions" text array, "globalAppreciation" text, "producerId" integer, CONSTRAINT "REL_b8745e49a2dce4699e0c2d6a2d" UNIQUE ("producerId"), CONSTRAINT "PK_028ea9e42a18aca76ea3c4b3e24" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "OpeningHours" ("id" SERIAL NOT NULL, "mondayOpen" character varying, "mondayClose" character varying, "tuesdayOpen" character varying, "tuesdayClose" character varying, "wednesdayOpen" character varying, "wednesdayClose" character varying, "thursdayOpen" character varying, "thursdayClose" character varying, "fridayOpen" character varying, "fridayClose" character varying, "saturdayOpen" character varying, "saturdayClose" character varying, "sundayOpen" character varying, "sundayClose" character varying, "producerId" integer, CONSTRAINT "REL_ce65ca2b119b97df3650773d57" UNIQUE ("producerId"), CONSTRAINT "PK_914a28a46d79db6ca1d5984ab89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."Producers_type_enum" AS ENUM('restaurant', 'leisure', 'wellness')`);
        await queryRunner.query(`CREATE TYPE "public"."Producers_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "Producers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying NOT NULL, "city" character varying, "country" character varying, "details" character varying, "mapsUrl" character varying, "placeId" character varying NOT NULL, "latitude" numeric(10,6), "longitude" numeric(10,6), "rating" jsonb, "phoneNumber" character varying, "website" character varying, "type" "public"."Producers_type_enum" NOT NULL, "status" "public"."Producers_status_enum" NOT NULL DEFAULT 'pending', "isActive" boolean NOT NULL DEFAULT true, "isDeleted" boolean NOT NULL DEFAULT false, "document1" character varying, "document2" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "UQ_dc403850528a9a46d3ce1ed04fd" UNIQUE ("placeId"), CONSTRAINT "REL_1b4b01a437def6ed0fb48e4872" UNIQUE ("userId"), CONSTRAINT "PK_36356145653aa70456caad318cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dc403850528a9a46d3ce1ed04f" ON "Producers" ("placeId") `);
        await queryRunner.query(`ALTER TABLE "Photos" ADD CONSTRAINT "FK_9e599621232e7c3ad24ba3674d9" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "AIAnalyses" ADD CONSTRAINT "FK_2fbe63f4f2bb25d82e85e59c448" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GlobalRatings" ADD CONSTRAINT "FK_b8745e49a2dce4699e0c2d6a2dc" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "OpeningHours" ADD CONSTRAINT "FK_ce65ca2b119b97df3650773d571" FOREIGN KEY ("producerId") REFERENCES "Producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Producers" ADD CONSTRAINT "FK_1b4b01a437def6ed0fb48e4872b" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Producers" DROP CONSTRAINT "FK_1b4b01a437def6ed0fb48e4872b"`);
        await queryRunner.query(`ALTER TABLE "OpeningHours" DROP CONSTRAINT "FK_ce65ca2b119b97df3650773d571"`);
        await queryRunner.query(`ALTER TABLE "GlobalRatings" DROP CONSTRAINT "FK_b8745e49a2dce4699e0c2d6a2dc"`);
        await queryRunner.query(`ALTER TABLE "AIAnalyses" DROP CONSTRAINT "FK_2fbe63f4f2bb25d82e85e59c448"`);
        await queryRunner.query(`ALTER TABLE "Photos" DROP CONSTRAINT "FK_9e599621232e7c3ad24ba3674d9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc403850528a9a46d3ce1ed04f"`);
        await queryRunner.query(`DROP TABLE "Producers"`);
        await queryRunner.query(`DROP TYPE "public"."Producers_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Producers_type_enum"`);
        await queryRunner.query(`DROP TABLE "OpeningHours"`);
        await queryRunner.query(`DROP TABLE "GlobalRatings"`);
        await queryRunner.query(`DROP TABLE "AIAnalyses"`);
        await queryRunner.query(`DROP TABLE "Photos"`);
    }

}

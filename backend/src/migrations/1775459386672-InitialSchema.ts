import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775459386672 implements MigrationInterface {
    name = 'InitialSchema1775459386672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "search_history" ("id" SERIAL NOT NULL, "query" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cb93c8f85dbdca85943ca494812" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "search_history"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexToHistory1775463034529 implements MigrationInterface {
    name = 'AddIndexToHistory1775463034529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_45485ceff4e97dbba6122d7c84" ON "search_history" ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_45485ceff4e97dbba6122d7c84"`);
    }

}

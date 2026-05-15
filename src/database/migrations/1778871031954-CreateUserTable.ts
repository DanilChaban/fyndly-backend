import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1778871031954 implements MigrationInterface {
    name = 'CreateUserTable1778871031954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "name" TO "username"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "username" TO "name"`);
    }

}

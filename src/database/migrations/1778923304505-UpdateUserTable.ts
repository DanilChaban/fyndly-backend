import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserTable1778923304505 implements MigrationInterface {
  name = 'UpdateUserTable1778923304505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "google_id" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "username" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "google_id"`);
  }
}

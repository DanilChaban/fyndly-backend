import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserTable1780770226037 implements MigrationInterface {
  name = 'UpdateUserTable1780770226037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumber" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "country" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "city" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "avatar" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "coverImage" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "coverImage"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
  }
}

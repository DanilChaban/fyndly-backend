import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserTable1779310533967 implements MigrationInterface {
  name = 'UpdateUserTable1779310533967';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "emailVerified" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "user" ADD "emailVerificationCode" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "emailVerificationCodeExpiresAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerificationCodeExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerificationCode"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerified"`);
  }
}

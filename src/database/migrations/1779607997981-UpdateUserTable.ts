import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserTable1779607997981 implements MigrationInterface {
  name = 'UpdateUserTable1779607997981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordCode" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordCodeExpiresAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordCodeLastSentAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordCodeLastSentAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordCodeExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordCode"`);
  }
}

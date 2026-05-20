import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserTable1779311648336 implements MigrationInterface {
  name = 'UpdateUserTable1779311648336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "emailVerificationCodeLastSentAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerificationCodeLastSentAt"`);
  }
}

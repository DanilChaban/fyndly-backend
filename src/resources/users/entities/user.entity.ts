import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TableName } from '@app/core/enums/table-name.enum';

@Entity({ name: TableName.USER })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'google_id', type: 'varchar', nullable: true, select: true })
  googleId: string | null;

  @Column({ nullable: true })
  username: string;

  @Column({ select: false, unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true, select: true })
  emailVerificationCode: string | null;

  @Column({ type: 'timestamp', nullable: true, select: true })
  emailVerificationCodeExpiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, select: true })
  emailVerificationCodeLastSentAt: Date | null;
}

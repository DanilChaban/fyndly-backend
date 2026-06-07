import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TableName } from '@core/enums/table-name.enum';

@Entity({ name: TableName.USER })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'google_id', type: 'varchar', nullable: true, select: false })
  googleId: string | null;

  @Column({ nullable: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ type: 'boolean', default: false, select: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  emailVerificationCode: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  emailVerificationCodeExpiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  emailVerificationCodeLastSentAt: Date | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  resetPasswordCode: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  resetPasswordCodeExpiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  resetPasswordCodeLastSentAt: Date | null;
}

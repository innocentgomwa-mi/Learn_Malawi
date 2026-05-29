import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export type TwoFactorPurpose = 'login' | 'enable' | 'disable';

@Entity('two_factor_challenges')
export class TwoFactorChallenge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  codeHash!: string;

  @Column({ type: 'varchar', length: 20 })
  purpose!: TwoFactorPurpose;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  used!: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}


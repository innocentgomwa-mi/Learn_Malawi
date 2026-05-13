import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../users/entities/user.entity';

@Entity('pending_registrations')
export class PendingRegistration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 150, nullable: true })
  school?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  level?: string;

  @Column({ type: 'boolean', default: false })
  agreeTerms!: boolean;

  @Column({ type: 'varchar', length: 6 })
  verificationCode!: string;

  @Column({ type: 'timestamp' })
  verificationExpiresAt!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}

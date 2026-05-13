import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('study_groups')
export class StudyGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column()
  level: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  scheduled_at?: string;

  @Column({ nullable: true })
  mentor_email?: string;

  @Column({ nullable: true })
  mentor_name?: string;

  @Column({ nullable: true })
  creator_email?: string;

  @Column({ nullable: true })
  creator_name?: string;

  @Column('text', { array: true, default: [] })
  members: string[];

  @Column('text', { array: true, default: [] })
  banned_members: string[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}

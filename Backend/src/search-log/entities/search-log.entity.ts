import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('search_log')
export class SearchLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  query: string;

  @Column({ nullable: true })
  user_email?: string;

  @Column({ nullable: true })
  user_name?: string;

  @Column({ nullable: true })
  user_role?: string;

  @Column({ type: 'int', nullable: true })
  results_count?: number;

  @Column({ nullable: true })
  subject_filter?: string;

  @Column({ nullable: true })
  level_filter?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}

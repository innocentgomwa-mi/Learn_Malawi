import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('data_change_history')
export class DataChangeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column()
  entity_type: string;

  @Column({ nullable: true })
  entity_id?: string;

  @Column({ nullable: true })
  performed_by_email?: string;

  @Column({ nullable: true })
  performed_by_name?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  before_data?: string;

  @Column({ type: 'text', nullable: true })
  after_data?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}

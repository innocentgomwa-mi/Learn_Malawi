import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('class_schedules')
export class ClassSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ nullable: true })
  class_level?: string;

  @Column()
  day_of_week: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({ nullable: true })
  room?: string;

  @Column({ default: true })
  is_recurring: boolean;

  @Column({ default: 'emerald' })
  color: string;

  @Column({ type: 'int', default: 0 })
  reminder_minutes: number;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  teacher_email: string;

  @CreateDateColumn({ name: 'created_date' })
  created_date: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updated_date: Date;
}

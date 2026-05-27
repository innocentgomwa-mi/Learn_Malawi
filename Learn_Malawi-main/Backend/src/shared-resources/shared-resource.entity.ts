import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shared_resources')
export class SharedResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  resource_type?: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ nullable: true })
  class_level?: string;

  @Column({ nullable: true })
  file_url?: string;

  @Column({ nullable: true })
  teacher_name?: string;

  @Column({ nullable: true })
  teacher_email?: string;

  @CreateDateColumn({ name: 'created_date' })
  created_date: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updated_date: Date;
}

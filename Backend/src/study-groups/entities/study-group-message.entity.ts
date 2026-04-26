import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StudyGroup } from './study-group.entity';

@Entity('study_group_messages')
export class StudyGroupMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_id' })
  group_id: string;

  @ManyToOne(() => StudyGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group?: StudyGroup;

  @Column({ type: 'text' })
  content: string;

  @Column()
  author_name: string;

  @Column()
  author_email: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}

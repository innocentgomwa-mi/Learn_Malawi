import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('resource_ratings')
export class ResourceRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource_id: string;

  @Column()
  user_email: string;

  @Column('int')
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}

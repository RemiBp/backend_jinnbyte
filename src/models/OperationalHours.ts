import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Restaurant from './Restaurant';
import User from './User';

@Entity('OperationalHour')
export default class OperationalHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  day: string;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @ManyToOne(() => User, user => user.operationalHours, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

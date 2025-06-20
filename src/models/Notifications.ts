import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import User from './User';

@Entity('Notification')
export default class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  notificationId: number;

  @Column({ nullable: true })
  jobId: number;

  @Column()
  type: string;

  @Column({ default: false })
  isSeen: boolean;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  body: string;

  @Column({ nullable: true })
  restaurantName: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;

  @Column({ nullable: true })
  purpose: string;
}

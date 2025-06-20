import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import User from './User';
import Booking from './booking';

@Entity('Reviews')
export default class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rating: number;

  @Column({ nullable: true })
  remarks: string;

  @Column({ default: true, nullable: true })
  isActive: boolean;

  @OneToOne(() => Booking, booking => booking.review, { eager: false })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  bookingId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column()
  customerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: User;

  @Column()
  restaurantId: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

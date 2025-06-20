import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
  ManyToMany,
} from 'typeorm';
import User from './User';
import { Point } from 'geojson';
import Slot from './Slots';
import Review from './Review';

export enum CancelByEnums {
  USER = 'user',
  RESTAURANT = 'restaurant',
  ADMIN = 'admin',
}

export enum StatusEnums {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  CANCEL = 'cancelled',
}

@Entity('Bookings')
export default class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  startDateTime: string;

  @Column({ nullable: false })
  endDateTime: string;

  @Column({ nullable: true })
  checkInAt: string;

  @Column({ nullable: true })
  cancelAt: string;

  @Column({ nullable: false })
  slotStartTime: string;

  @Column({ nullable: false })
  slotEndTime: string;

  @Column({ nullable: false })
  bookingDate: string;

  @Column({
    type: 'enum',
    enum: StatusEnums,
    default: StatusEnums.SCHEDULED,
  })
  status: StatusEnums;

  @Column()
  location: string;

  @Column({ nullable: true })
  customerName: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: User;

  @Column({ default: false })
  reviewAdded: boolean;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  locationPoint: Point;

  @Column({ nullable: true })
  timeZone: string;

  @Column({
    type: 'enum',
    enum: CancelByEnums,
    nullable: true,
  })
  cancelBy: CancelByEnums;

  @Column({ nullable: true })
  cancelReason: string;

  @Column()
  guestCount: number;

   @Column({ nullable: true })
  specialRequest: string;

  @Column({ nullable: true })
  day: string;

  @Column({ nullable: true })
  date: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToOne(() => Review, (review) => review.booking)
  review: Review;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import User from './User';
import { Point } from 'geojson';
import CuisineType from './CuisineType';
import OperationalHour from './OperationalHours';

export enum accountStatusEnums {
  PENDING = 'pending',
  UNDER_REVIEW = 'underReview',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('Restaurant')
export default class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.restaurant)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Column()
  restaurantName: string;

  @Column()
  restaurantDetails: string;

  @ManyToOne(() => CuisineType, cuisineType => cuisineType.restaurants)
  cuisineType: CuisineType;

  @Column()
  address: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  locationPoint: Point;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rating: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  certificateOfHospitality: string;

  @Column({ nullable: true })
  certificateOfTourism: string;

  @Column({ nullable: true })
  menu: string;

  @Column({ nullable: true })
  rejectReason: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  slotDuration: number;

  @Column({
    type: 'enum',
    enum: accountStatusEnums,
    default: accountStatusEnums.PENDING,
  })
  accountStatus: accountStatusEnums;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

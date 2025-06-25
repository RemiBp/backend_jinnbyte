import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import User from './User';

@Entity('BusinessProfiles')
export default class BusinessProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  businessName: string;

  @OneToOne(() => User, user => user.businessProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
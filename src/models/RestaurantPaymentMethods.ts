import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Restaurant from './Restaurant';
import User from './User';
import PaymentMethods from './PaymentMethods';

@Entity('RestaurantPaymentMethods')
export default class RestaurantPaymentMethods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => PaymentMethods)
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethods: PaymentMethods;

  @Column()
  paymentMethodId: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

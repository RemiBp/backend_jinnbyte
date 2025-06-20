import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import User from './User';

@Entity('PasswordResetOTP')
export default class PasswordResetOTP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  otp: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiry: Date;

  @Column({ default: false })
  isVerified: boolean;

  @ManyToOne(() => User, (user: User) => user.passwordResetOTPs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import User from './User';

@Entity('SocialLogin')
export default class SocialLogin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  platform: string;

  @Column()
  platformId: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => User, user => user.socialLogin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
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

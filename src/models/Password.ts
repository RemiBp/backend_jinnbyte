import {
  Entity,
  OneToOne,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import User from './User';

@Entity('Password')
export default class Password {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;

  @OneToOne(() => User, user => user.Password)
  @JoinColumn({ name: 'userId' })
  user: User;
}

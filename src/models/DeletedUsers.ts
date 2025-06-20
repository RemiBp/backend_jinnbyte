import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import User from './User';
import DeleteReason from './DeleteReason';

export enum userRoleEnums {
  COMPANY = 'restaurant',
  USER = 'user',
}

@Entity('DeletedUsers')
export default class DeletedUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: userRoleEnums })
  role: userRoleEnums;

  @ManyToOne(() => DeleteReason, (deleteReason: DeleteReason) => deleteReason.deletedUsers, { nullable: true })
  @JoinColumn({ name: 'deleteReasonId' })
  deleteReason: DeleteReason;

  @Column({ type: 'varchar', nullable: true })
  otherReason: string;

  @OneToOne(() => User, (user: User) => user.deletedUsers)
  @JoinColumn({ name: 'userId' })
  user: User[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

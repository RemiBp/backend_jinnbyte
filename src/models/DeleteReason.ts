import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import User from './User';
import DeletedUsers from './DeletedUsers';

export enum userRoleEnums {
  COMPANY = 'restaurant',
  USER = 'user',
}

@Entity('DeleteReason')
export default class DeleteReason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deleteReason: string;

  @Column({ type: 'enum', enum: userRoleEnums })
  role: userRoleEnums;

  @OneToMany(() => DeletedUsers, (deletedUsers: DeletedUsers) => deletedUsers.deleteReason)
  deletedUsers: DeletedUsers;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

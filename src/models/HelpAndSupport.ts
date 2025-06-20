import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('HelpAndSupport')
export default class HelpAndSupport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  emailForCustomers: string;

  @Column()
  emailForRestaurants: string;

  @Column()
  phoneForCustomers: string;

  @Column()
  phoneForRestaurants: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}

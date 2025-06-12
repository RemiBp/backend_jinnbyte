import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Plan } from "./Plan";

@Entity("Customer")
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stripeCustomerId: string;

  @Column()
  stripeSubscriptionId: string;

  @Column()
  customerEmail: string;

  @OneToOne(() => User, (user) => user.customer)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.id)
  @JoinColumn()
  plan: Plan;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isTrial: boolean;

  @Column({ default: false })
  isBlocked: boolean;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()", onUpdate: "NOW()" })
  updatedAt: Date;
}

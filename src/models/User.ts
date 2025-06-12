import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { OTP } from "./OTP";
import { Customer } from "./Customer";
import { LastActionAt } from "./LastActionAt";

@Entity("User")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: "simple-array", default: "", select: false })
  refreshTokens: string[];

  @OneToMany(() => OTP, (otp) => otp.user)
  otpCodes: OTP[];

  @Column({ default: false })
  onboarding: boolean;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  plan: string;

  @Column({ nullable: true })
  trial: number;

  @Column({ type: "jsonb", default: {} })
  metadata: object;

  @Column({ type: "timestamptz", nullable: true })
  email_verified_at: Date;

  @OneToOne(() => LastActionAt, (lastActionAt) => lastActionAt.user)
  lastActionAt: Date;

  @OneToOne(() => Customer, (customer) => customer.user)
  customer: Customer;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()", select: false })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()", onUpdate: "NOW()", select: false })
  updated_at: Date;
}

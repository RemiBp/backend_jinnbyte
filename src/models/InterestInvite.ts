import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import User from "./User";
import Interest from "./Interest";
import { InviteStatus } from "../enums/inviteStatus.enum";

@Entity("InterestInvite")
export default class InterestInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Interest, (interest) => interest.invites, { onDelete: "CASCADE" })
  @JoinColumn({ name: "interestId" })
  interest: Interest;

  @Column()
  interestId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invitedUserId" })
  invitedUser: User;

  @Column()
  invitedUserId: number;

  @Column({
    type: "enum",
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({ type: "text", nullable: true })
  declineReason?: string;

  @Column({ nullable: true })
  suggestedSlotId?: number;

  @Column({ type: "timestamptz", nullable: true })
  suggestedTime?: Date;

  @Column({ type: "text", nullable: true })
  suggestedMessage?: string;

  @Column({ type: "timestamptz", nullable: true })
  respondedAt?: Date;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "NOW()",
    onUpdate: "NOW()",
  })
  updatedAt: Date;
}

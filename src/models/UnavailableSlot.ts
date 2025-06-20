import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./User";
import Slot  from "./Slots";

@Entity("UnavailableSlot")
export default class UnavailableSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Slot)
  @JoinColumn({ name: "slotId" })
  slot: Slot;

  @Column()
  slotId: number;


  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;


  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "NOW()",
    onUpdate: "NOW()",
  })
  updatedAt: Date;
}

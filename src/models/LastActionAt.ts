import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity("LastActionAt")
export class LastActionAt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz", nullable: true })
  timestamp: Date;

  @OneToOne(() => User, (user) => user.lastActionAt, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;
}

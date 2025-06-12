import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("OTP")
export class OTP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  otpCode: string;

  @Column({ type: "enum", enum: ["register", "signin", "change_email"] })
  purpose: "register" | "signin" | "change_email";

  @Column({ nullable: true }) // just gonna use this for change email and maybe something else later down the line if needed
  content: string;

  @Column({ default: false })
  isUsed: boolean;

  @ManyToOne(() => User, (user) => user.otpCodes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user" })
  user: User;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()", select: false })
  created_at: Date;
}

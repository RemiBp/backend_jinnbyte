import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import User from "./User";
import Event from "./Event";
import { BookingStatusEnums } from "../enums/bookingStatus.enum";

@Entity("EventBookings")
export default class EventBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Event, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @Column({ type: "int", default: 1 })
  numberOfPersons: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  totalPrice: number;

  @Column({
    type: "enum",
    enum: BookingStatusEnums,
    default: BookingStatusEnums.SCHEDULED,
  })
  status: BookingStatusEnums;

  @Column({ type: "text", nullable: true })
  internalNotes: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;
}

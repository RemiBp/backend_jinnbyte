import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./Customer";

@Entity("Plan")
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  stripeProductId: string;

  @OneToMany(() => Customer, (customer) => customer.id)
  customer: Customer;
}

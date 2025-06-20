import { nullable } from "zod";

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Column,
} from "typeorm";
import User from "./User";

@Entity("FavouriteRestaurant")
export default class FavouriteRestaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.addFavourite)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.favouriteRestaurant)
  @JoinColumn({ name: "restaurantId" })
  restaurant: User;

  @Column()
  restaurantId: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "NOW()",
    onUpdate: "NOW()",
  })
  updatedAt: Date;
}

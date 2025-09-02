import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";
import MenuDishes from "./MenuDishes";
import Post from "./Post";

@Entity("DishRatings")
export default class DishRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  rating: number;

  @ManyToOne(() => User, (user) => user.dishRatings, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => MenuDishes, { onDelete: "CASCADE" })
  dish: MenuDishes;

  @Column()
  dishId: number;

  @ManyToOne(() => Post, (post) => post.dishRatings, { onDelete: "CASCADE" })
  post: Post;

  @Column()
  postId: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}


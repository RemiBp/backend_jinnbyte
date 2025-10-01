import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
  Column
} from "typeorm";
import User from "./User";
import Post from "./Post";
import Producer from "./Producer";

@Entity("bookmarks")
@Unique(["userId", "postId", "producerId"])
export default class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: true })
  postId: number;

  @ManyToOne(() => Post, (post) => post.bookmarks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post: Post;

  @Column({ nullable: true })
  producerId: number;

  @ManyToOne(() => Producer, (producer) => producer.bookmarks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "producerId" })
  producer: Producer;

  @CreateDateColumn()
  createdAt: Date;
}

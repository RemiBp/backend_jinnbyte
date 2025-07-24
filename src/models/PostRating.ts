import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    Check,
} from 'typeorm';
import User from './User';
import { RatingCriteria } from '../enums/rating.enum';

@Entity('PostRatings')
@Check('"rating" >= 0 AND "rating" <= 5')
@Index('IDX_PostRating_userId_postId_criteria', ['userId', 'postId', 'criteria'], { unique: true })
export default class PostRating {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    postId: number;

    @Column()
    criteria: RatingCriteria;

    @Column('decimal', { precision: 2, scale: 1 })
    rating: number; // 0.0 to 5.0

    @Column('text', { nullable: true })
    comment: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne('Post', 'ratings', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: any;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date;

    @Index()
    @Column({ default: false })
    isDeleted: boolean;
}

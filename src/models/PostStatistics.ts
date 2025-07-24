import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { RatingCriteria } from '../enums/rating.enum';

@Entity('PostStatistics')
export default class PostStatistics {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    postId: number;

    @Column({ default: 0 })
    totalLikes: number;

    @Column({ default: 0 })
    totalShares: number;

    @Column({ default: 0 })
    totalComments: number;

    @Column({ default: 0 })
    totalRatings: number;

    @Column('decimal', { precision: 3, scale: 2, nullable: true })
    averageRating: number;

    // Store individual criteria ratings as JSONB for flexibility
    @Column('jsonb', { nullable: true })
    criteriaRatings: Record<RatingCriteria, {
        average: number;
        count: number;
    }>;

    // Store emotion counts
    @Column('jsonb', { nullable: true })
    emotionCounts: Record<string, number>;

    @OneToOne('Post', 'statistics', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: any;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}

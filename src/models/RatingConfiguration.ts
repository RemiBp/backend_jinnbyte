import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { PostType } from '../enums/post.enum';
import { RatingCriteria } from '../enums/rating.enum';

@Entity('RatingConfigurations')
@Index('IDX_RatingConfiguration_postType_criteria', ['postType', 'criteria'], { unique: true })
export default class RatingConfiguration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: PostType,
    })
    postType: PostType;

    @Column()
    criteria: RatingCriteria;

    @Column()
    displayName: string;

    @Column()
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 1 })
    sortOrder: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}

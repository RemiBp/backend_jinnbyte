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
} from 'typeorm';

@Entity('PostImages')
export default class PostImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    postId: number;

    @Column()
    url: string;

    @Column({ default: false })
    isCoverImage: boolean;

    @ManyToOne('Post', 'images', { onDelete: 'CASCADE' })
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

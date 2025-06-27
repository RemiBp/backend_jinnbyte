import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import Producer from './Producer';

@Entity('GlobalRatings')
export default class GlobalRating {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('float', { nullable: true })
    service: number;

    @Column('float', { nullable: true })
    location: number;

    @Column('float', { nullable: true })
    portions: number;

    @Column('float', { nullable: true })
    ambiance: number;

    @Column('jsonb', { nullable: true })
    aspects: Record<string, number>;

    @Column('text', { array: true, nullable: true })
    emotions: string[];

    @Column('text', { nullable: true })
    globalAppreciation: string;

    @OneToOne(() => Producer, { onDelete: 'CASCADE' })
    @JoinColumn()
    producer: Producer;
}

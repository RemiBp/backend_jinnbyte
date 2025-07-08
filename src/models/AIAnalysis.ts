import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import Producer from './Producer';

@Entity('AIAnalyses')
export default class AIAnalysis {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('float', { nullable: true }) careQuality: number;
    @Column('float', { nullable: true }) cleanliness: number;
    @Column('float', { nullable: true }) welcome: number;
    @Column('float', { nullable: true }) valueForMoney: number;
    @Column('float', { nullable: true }) atmosphere: number;
    @Column('float', { nullable: true }) staffExpertise: number;

    // @Column('float', { nullable: true }) haircutQuality: number;
    @Column('float', { nullable: true }) expectationRespect: number;
    @Column('float', { nullable: true }) advice: number;
    @Column('float', { nullable: true }) productsUsed: number;
    @Column('float', { nullable: true }) pricing: number;
    @Column('float', { nullable: true }) punctuality: number;

    @Column('float', { nullable: true }) precision: number;
    @Column('float', { nullable: true }) hygiene: number;
    @Column('float', { nullable: true }) creativity: number;
    @Column('float', { nullable: true }) durability: number;
    @Column('float', { nullable: true }) painExperience: number;

    @Column('float', { nullable: true }) averageScore: number;

    @OneToOne(() => Producer, { onDelete: 'CASCADE' })
    @JoinColumn()
    producer: Producer;
}

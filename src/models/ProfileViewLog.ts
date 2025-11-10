import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Unique,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import User from './User';
import Producer from './Producer';

@Entity('ProfileViewLogs')
@Unique(['viewerId', 'producerId', 'date'])
export default class ProfileViewLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    viewerId: number;

    @Column()
    producerId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'viewerId' })
    viewer: User;

    @ManyToOne(() => Producer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'producerId' })
    producer: Producer;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    date: string;

    @CreateDateColumn()
    createdAt: Date;
}

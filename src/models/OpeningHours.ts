import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import Producer from './Producer';

@Entity('OpeningHours')
export default class OpeningHours {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true }) mondayOpen: string;
    @Column({ nullable: true }) mondayClose: string;

    @Column({ nullable: true }) tuesdayOpen: string;
    @Column({ nullable: true }) tuesdayClose: string;

    @Column({ nullable: true }) wednesdayOpen: string;
    @Column({ nullable: true }) wednesdayClose: string;

    @Column({ nullable: true }) thursdayOpen: string;
    @Column({ nullable: true }) thursdayClose: string;

    @Column({ nullable: true }) fridayOpen: string;
    @Column({ nullable: true }) fridayClose: string;

    @Column({ nullable: true }) saturdayOpen: string;
    @Column({ nullable: true }) saturdayClose: string;

    @Column({ nullable: true }) sundayOpen: string;
    @Column({ nullable: true }) sundayClose: string;

    @OneToOne(() => Producer, producer => producer.openingHours, { onDelete: 'CASCADE' })
    @JoinColumn()
    producer: Producer;
}

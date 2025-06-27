import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Producer from './Producer';

@Entity('Photos')
export default class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  source: string; // e.g., "google", "tripadvisor", etc.

  @ManyToOne(() => Producer, producer => producer.photos, { onDelete: 'CASCADE' })
  @JoinColumn()
  producer: Producer;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import Wellness from "./Wellness";
import WellnessServiceType from "./WellnessServiceTypes";

@Entity("WellnessServices")
export default class WellnessService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  wellnessId: number;

  @ManyToOne(() => Wellness, (wellness) => wellness.selectedServices, { onDelete: "CASCADE" })
  @JoinColumn({ name: "wellnessId" })
  wellness: Wellness;

  @Column()
  serviceTypeId: number;

  @ManyToOne(() => WellnessServiceType, { onDelete: "CASCADE" })
  @JoinColumn({ name: "serviceTypeId" })
  serviceType: WellnessServiceType;
}

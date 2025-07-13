import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Doctor} from "../../doctor/entity/doctor.entity";

@Entity()
export class Clinic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Doctor, doctor => doctor.clinics)
    @JoinTable()
    doctors: Doctor[];
}

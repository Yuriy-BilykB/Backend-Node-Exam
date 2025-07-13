import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Doctor} from "../../doctor/entity/doctor.entity";

@Entity()
export class Favor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Doctor, doctor => doctor.favors)
    @JoinTable()
    doctors: Doctor[];
}

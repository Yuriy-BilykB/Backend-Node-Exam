import {Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Clinic} from "../../clinic/entity/clinic.entity";
import {Favor} from "../../favor/entity/favor.entity";

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    phoneNumber: string;

    @Column({ unique: true })
    email: string;

    @ManyToMany(() => Clinic, clinic => clinic.doctors)
    clinics: Clinic[];

    @ManyToMany(() => Favor, favor => favor.doctors)
    favors: Favor[];
}
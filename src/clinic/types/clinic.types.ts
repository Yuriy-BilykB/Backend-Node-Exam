import {Clinic} from "../entity/clinic.entity";
import {Favor} from "../../favor/entity/favor.entity";

export type ClinicWithFavors = Clinic & { favors: Favor[] };
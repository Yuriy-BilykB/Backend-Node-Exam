import { MigrationInterface, QueryRunner } from "typeorm";

export class Nitchema1749069670435 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "clinic" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_8b21d5e8e22b6ba5b0c0c0c0c0c" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "doctor" (
                "id" SERIAL NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "phoneNumber" character varying NOT NULL,
                "email" character varying NOT NULL,
                CONSTRAINT "UQ_doctor_email" UNIQUE ("email"),
                CONSTRAINT "PK_doctor_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "favor" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_favor_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "clinic_doctors_doctor" (
                "clinicId" integer NOT NULL,
                "doctorId" integer NOT NULL,
                CONSTRAINT "PK_clinic_doctors" PRIMARY KEY ("clinicId", "doctorId")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "doctor_favors_favor" (
                "doctorId" integer NOT NULL,
                "favorId" integer NOT NULL,
                CONSTRAINT "PK_doctor_favors" PRIMARY KEY ("doctorId", "favorId")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "clinic_doctors_doctor" 
            ADD CONSTRAINT "FK_clinic_doctors_clinic" 
            FOREIGN KEY ("clinicId") REFERENCES "clinic"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "clinic_doctors_doctor" 
            ADD CONSTRAINT "FK_clinic_doctors_doctor" 
            FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "doctor_favors_favor" 
            ADD CONSTRAINT "FK_doctor_favors_doctor" 
            FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "doctor_favors_favor" 
            ADD CONSTRAINT "FK_doctor_favors_favor" 
            FOREIGN KEY ("favorId") REFERENCES "favor"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_favors_favor" DROP CONSTRAINT "FK_doctor_favors_favor"`);
        await queryRunner.query(`ALTER TABLE "doctor_favors_favor" DROP CONSTRAINT "FK_doctor_favors_doctor"`);
        await queryRunner.query(`ALTER TABLE "clinic_doctors_doctor" DROP CONSTRAINT "FK_clinic_doctors_doctor"`);
        await queryRunner.query(`ALTER TABLE "clinic_doctors_doctor" DROP CONSTRAINT "FK_clinic_doctors_clinic"`);

        await queryRunner.query(`DROP TABLE "doctor_favors_favor"`);
        await queryRunner.query(`DROP TABLE "clinic_doctors_doctor"`);
        await queryRunner.query(`DROP TABLE "favor"`);
        await queryRunner.query(`DROP TABLE "doctor"`);
        await queryRunner.query(`DROP TABLE "clinic"`);
        await queryRunner.query(`DROP TABLE "user"`);

        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }
}

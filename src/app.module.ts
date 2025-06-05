import {Module} from '@nestjs/common';
import {AuthModule} from './auth/auth.module';
import {ClinicModule} from './clinic/clinic.module';
import {DoctorModule} from './doctor/doctor.module';
import {FavorModule} from './favor/favor.module';
import {ConfigModule} from "@nestjs/config";
import {TokensModule} from './tokens/tokens.module';
import {MailModule} from './mail/mail.module';
import {AppDatabase} from "./type_orm/typeorm.database";

@Module({
    imports: [AppDatabase, AuthModule, ClinicModule, DoctorModule, FavorModule, ConfigModule.forRoot({
        isGlobal: true
    }), TokensModule, MailModule],
})
export class AppModule {
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {EnvService} from "../shared/envServices/envServices";
import {SharedModule} from "../shared/sharedModule";
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [SharedModule],
            useFactory: (envService: EnvService) => ({
                type: 'postgres',
                host: envService.dbHost,
                port: envService.dbPort,
                username: envService.dbUser,
                password: envService.dbPassword,
                database: envService.dbName,
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                migrations: [__dirname + '/migrations/*{.ts,.js}'],
                autoLoadEntities: true,
                synchronize: false,
                logging: true,
            }),
            inject: [EnvService],
        }),
    ],
})
export class AppDatabase {}

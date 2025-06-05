import {ConfigService} from "@nestjs/config";
import { DataSource } from 'typeorm';
import {EnvService} from "./shared/envServices/envServices";

const configService = new ConfigService();
const envService = new EnvService(configService);


export default new DataSource({
    type: 'postgres',
    host: envService.dbHost,
    port: envService.dbPort,
    username: envService.dbUser,
    password: envService.dbPassword,
    database: envService.dbName,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
});

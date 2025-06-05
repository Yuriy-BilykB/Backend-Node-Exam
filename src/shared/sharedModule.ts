import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {EnvService} from "./envServices/envServices";

@Module({
    imports: [ConfigModule],
    providers: [EnvService],
    exports: [EnvService],
})
export class SharedModule {}
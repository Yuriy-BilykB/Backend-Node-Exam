import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
    public readonly accessTokenSecret: string;
    public readonly accessTokenExpiration: string;

    public readonly refreshTokenSecret: string;
    public readonly refreshTokenExpiration: string;

    public readonly recoveryTokenSecret: string;
    public readonly recoveryTokenExpiration: string;

    public readonly emailHost: string;
    public readonly emailPort: number;
    public readonly emailUser: string;
    public readonly emailPassword: string;

    public readonly port: number;

    public readonly dbPassword: string;
    public readonly dbPort: number;
    public readonly dbHost: string;
    public readonly dbUser: string;
    public readonly dbName: string;

    constructor(private configService: ConfigService) {
        this.accessTokenSecret = configService.get<string>('ACCESS_TOKEN_SECRET', 'default-access-secret');
        this.accessTokenExpiration = configService.get<string>('EXPIRES_ACCESS_TOKEN', '15m');

        this.refreshTokenSecret = configService.get<string>('REFRESH_TOKEN_SECRET', 'default-refresh-secret');
        this.refreshTokenExpiration = configService.get<string>('EXPIRES_REFRESH_TOKEN', '7d');

        this.recoveryTokenSecret = configService.get<string>('RECOVERY_TOKEN_SECRET', 'default-recovery-secret');
        this.recoveryTokenExpiration = configService.get<string>('EXPIRES_RECOVERY_TOKEN', '5m');

        this.emailHost = configService.get<string>('EMAIL_HOST', 'smtp.gmail.com');
        this.emailPort = configService.get<number>('EMAIL_PORT', 465);
        this.emailUser = configService.get<string>('EMAIL_USER', 'user@example.com');
        this.emailPassword = configService.get<string>('EMAIL_PASSWORD', 'password');

        this.port = configService.get<number>('PORT', 5000);

        this.dbPassword = configService.get<string>('DB_PASSWORD', '8246');
        this.dbPort = configService.get<number>('DB_PORT', 5432);
        this.dbHost = configService.get<string>('DB_HOST', 'localhost');
        this.dbUser = configService.get<string>('DB_USER', 'postgres');
        this.dbName = configService.get<string>('DB_NAME', 'hospital_db');
    }
}

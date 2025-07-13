import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import * as cookieParser from 'cookie-parser';
import {ConfigService} from "@nestjs/config";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    const port = process.env.PORT ?? 5000;

    const config = new DocumentBuilder()
        .setTitle('Clinic API')
        .setDescription('API services')
        .setVersion('1.0')
        .addTag('Clinic')
        .addTag('Doctor')
        .addTag('Favor')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(port);

    console.log(`Server started on http://localhost:${port}`);
}
bootstrap();

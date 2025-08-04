import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import * as cookieParser from 'cookie-parser';
import {ConfigService} from "@nestjs/config";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ValidationPipe} from "@nestjs/common";
import {HttpExceptionFilter} from "./shared/filters/http-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalFilters(new HttpExceptionFilter());
    
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ 
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        errorHttpStatusCode: 400,
    }));

    const port = process.env.PORT ?? 5000;

    const config = new DocumentBuilder()
        .setTitle('Hospital Management API')
        .setDescription('API for managing hospitals, doctors, and medical favors')
        .setVersion('1.0')
        .addTag('Clinics', 'Hospital clinic management')
        .addTag('Doctors', 'Doctor management')
        .addTag('Favors', 'Medical favors management')
        .addTag('Auth', 'Authentication and authorization')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(port);

    console.log(`Server started on http://localhost:${port}`);
}
bootstrap();

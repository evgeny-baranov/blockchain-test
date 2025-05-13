import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as fs from 'fs';
import {BigIntSerializerInterceptor} from "./interceptor/bigint-serializer.interceptor";
import {BigIntExceptionFilter} from "./interceptor/bigint-exception.filter";

async function bootstrap() {
    const httpsOptions = {
        key: fs.readFileSync('cert/key.pem'),
        cert: fs.readFileSync('cert/cert.pem'),
    };
    const app = await NestFactory.create(AppModule, {
        httpsOptions,
    });

    app.useGlobalInterceptors(new BigIntSerializerInterceptor());
    app.useGlobalFilters(new BigIntExceptionFilter());

    await app.listen(process.env.SERVER_PORT ?? 3000);
}

bootstrap();

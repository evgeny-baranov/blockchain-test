import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import {Response} from 'express';
import {replaceBigInt} from "./replace-bigint";

@Catch(HttpException)
export class BigIntExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const originalResponse = exception.getResponse();

        if (typeof originalResponse === 'object' && originalResponse !== null) {
            response.status(status).json(replaceBigInt(originalResponse));
        } else {
            response.status(status).json(originalResponse);
        }
    }
}

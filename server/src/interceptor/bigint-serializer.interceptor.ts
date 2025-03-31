import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import {Observable, map} from 'rxjs';

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => JSON.parse(JSON.stringify(data, this.bigIntReplacer))),
        );
    }

    private bigIntReplacer(key: string, value: any): any {
        return typeof value === 'bigint' ? value.toString() : value;
    }
}

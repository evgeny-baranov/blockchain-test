import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {Server} from 'http';
import request from 'supertest';
import {AppModule} from '../src/app.module';
import {BigIntSerializerInterceptor} from "../src/interceptor/bigint-serializer.interceptor";
import {BigIntExceptionFilter} from "../src/interceptor/bigint-exception.filter";

describe('accounting/balance (e2e)', () => {
    const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    let app: INestApplication;
    let server: Server;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalInterceptors(new BigIntSerializerInterceptor());
        app.useGlobalFilters(new BigIntExceptionFilter());
        await app.init();

        server = app.getHttpServer();
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /accounting/balance/:address returns correct balance structure', async () => {
        const response = await request(server)
            .get(`/accounting/balance/${address}`)
            .expect(200);

        expect(response.body).toHaveProperty('usd', "0");
        expect(response.body).toHaveProperty('eur', "0");
        expect(typeof response.body.eth).toBe('string');
        expect(BigInt(response.body.eth)).toBeGreaterThan(0n);
    });

    it('PUT /accounting/balance/:address/usd/:amount sets balance', async () => {
        const amount = '11000000';

        await request(server)
            .put(`/accounting/balance/${address}/usd/${amount}`)
            .expect(400);
    });
});

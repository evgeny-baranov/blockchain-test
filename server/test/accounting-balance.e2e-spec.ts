import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('accounting/balance (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('PUT /accounting/balance/:address/usd/:amount sets balance', async () => {
        const address = '0x1234567890abcdef1234567890abcdef12345678';
        const amount = '11000000';

        const response = await request(app.getHttpServer())
            .put(`/accounting/balance/${address}/usd/${amount}`)
            .expect(200);
    });
});

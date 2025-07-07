import request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {RoleModule} from '../src/role/role.module';
import {BigIntSerializerInterceptor} from "../src/interceptor/bigint-serializer.interceptor";
import {BigIntExceptionFilter} from "../src/interceptor/bigint-exception.filter";

describe('RoleController (e2e)', () => {
    const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [RoleModule],
        }).compile();

        app = moduleRef.createNestApplication();

        app.useGlobalInterceptors(new BigIntSerializerInterceptor());
        app.useGlobalFilters(new BigIntExceptionFilter());

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/role (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get('/role')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('label');
        expect(response.body[0]).toHaveProperty('role');
        expect(response.body[0]).toHaveProperty('selectors');
    });

    it('/role/my (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get('/role/my')
            .expect(200);

        const labels = response.body.map((r: any) => r.label);
        expect(labels).toContain('ADMIN');

        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('/role/:address (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get(`/role/${address}`)
            .expect(200);

        const labels = response.body.map((r: any) => r.label);
        expect(labels).toContain('ADMIN');

        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('/role/:address/:role (PUT)', async () => {
        await request(app.getHttpServer())
            .put(`/role/${address}/MINTER`)
            .expect(200);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await request(app.getHttpServer())
            .get(`/role/${address}`)
            .expect(200);

        const labels = response.body.map((r: any) => r.label);
        expect(labels).toContain('MINTER');
    });

    it('/role/:address/:role (DELETE)', async () => {
        await request(app.getHttpServer())
            .delete(`/role/${address}/MINTER`)
            .expect(200);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await request(app.getHttpServer())
            .get(`/role/${address}`)
            .expect(200);

        const labels = response.body.map((r: any) => r.label);
        expect(labels).not.toContain('MINTER');
    });
});

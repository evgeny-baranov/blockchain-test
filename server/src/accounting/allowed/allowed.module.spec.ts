import {Test, TestingModule} from '@nestjs/testing';
import {AllowedModule} from './allowed.module';
import {AllowedService} from './allowed.service';
import {AllowedController} from './allowed.controller';

describe('AllowedModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        process.env.CHAIN_ID = '31337';

        module = await Test.createTestingModule({
            imports: [AllowedModule],
        }).compile();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should provide AllowedService', () => {
        const service = module.get<AllowedService>(AllowedService);
        expect(service).toBeInstanceOf(AllowedService);
    });

    it('should provide AllowedController', () => {
        const controller = module.get<AllowedController>(AllowedController);
        expect(controller).toBeInstanceOf(AllowedController);
    });
});

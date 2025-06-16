import {Test, TestingModule} from '@nestjs/testing';
import {BalanceModule} from "./balance.module";
import {BalanceController} from "./balance.controller";
import {BalanceService} from "./balance.service";

describe('BalanceModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        process.env.CHAIN_ID = '31337';

        module = await Test.createTestingModule({
            imports: [BalanceModule],
        }).compile();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should provide BalanceService', () => {
        const service = module.get<BalanceService>(BalanceService);
        expect(service).toBeInstanceOf(BalanceService);
    });

    it('should provide BalanceController', () => {
        const controller = module.get<BalanceController>(BalanceController);
        expect(controller).toBeInstanceOf(BalanceController);
    });
});

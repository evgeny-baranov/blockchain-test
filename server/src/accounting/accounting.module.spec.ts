import {Test, TestingModule} from '@nestjs/testing';
import {AccountingModule} from './accounting.module';
import {AccountingService} from './accounting.service';
import {AccountingController} from './accounting.controller';

describe('AccountingModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [AccountingModule],
        }).compile();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should provide AccountingService', () => {
        const service = module.get<AccountingService>(AccountingService);
        expect(service).toBeInstanceOf(AccountingService);
    });

    it('should provide AccountingController', () => {
        const controller = module.get<AccountingController>(AccountingController);
        expect(controller).toBeInstanceOf(AccountingController);
    });
});

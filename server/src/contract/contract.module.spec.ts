import {Test, TestingModule} from '@nestjs/testing';
import {ContractModule} from './contract.module';
import {ContractService} from './contract.service';
import {ContractController} from './contract.controller';

describe('ContractModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        process.env.CHAIN_ID = '31337';

        module = await Test.createTestingModule({
            imports: [ContractModule],
        }).compile();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should provide ContractService', () => {
        const service = module.get<ContractService>(ContractService);
        expect(service).toBeInstanceOf(ContractService);
    });

    it('should provide ContractController', () => {
        const controller = module.get<ContractController>(ContractController);
        expect(controller).toBeInstanceOf(ContractController);
    });
});

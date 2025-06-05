import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';

describe('ContractController', () => {
    let controller: ContractController;
    let service: ContractService;

    const mockContractService = {
        registeredContracts: jest.fn(),
        getContract: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContractController],
            providers: [
                {
                    provide: ContractService,
                    useValue: mockContractService,
                },
            ],
        }).compile();

        controller = module.get<ContractController>(ContractController);
        service = module.get<ContractService>(ContractService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return registered contracts', async () => {
        const mockResult = { ContractA: '0x123' };
        mockContractService.registeredContracts.mockResolvedValue(mockResult);

        const result = await controller.registeredContracts();
        expect(result).toEqual(mockResult);
        expect(service.registeredContracts).toHaveBeenCalled();
    });

    it('should return a contract by name', async () => {
        const name = 'AccessManager';
        const mockAddress = '0x456';
        mockContractService.getContract.mockResolvedValue(mockAddress);

        const result = await controller.getContract(name);
        expect(result).toBe(mockAddress);
        expect(service.getContract).toHaveBeenCalledWith(name);
    });
});

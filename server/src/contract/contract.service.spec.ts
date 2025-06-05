import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { ChainContractsService } from '../chain-contracts/chain-contracts.service';
import {MockChainContractsService} from "../__mock__/chain-contract-service.mock";
import {mockContractRegistry} from "../__mock__/contracts.mock";
import {keccak256, toUtf8Bytes} from "ethers";

describe('ContractService', () => {
    const address = '0xdeadbeef00000000000000000000000000000001';

    let contractService: ContractService;
    let mockChainContractsService: any;

    beforeEach(async () => {
        mockChainContractsService = new MockChainContractsService();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContractService,
                {
                    provide: ChainContractsService,
                    useValue: mockChainContractsService,
                },
            ],
        }).compile();

        contractService = module.get<ContractService>(ContractService);
        contractService.onModuleInit();
    });

    it('should return contract address from getContract()', async () => {
        const contractName = 'contract';
        const fnGetContract = jest.fn().mockReturnValue(address);

        (contractService as any).accessManager.getContract = fnGetContract;
        const result = await contractService.getContract(contractName);

        expect(fnGetContract).toHaveBeenCalledWith(contractName);
        expect(result).toBe(address);
    });

    it('should return all registered contracts as object from registeredContracts()', async () => {
        const getRegisteredContracts = jest.fn().mockResolvedValue(mockContractRegistry);
        (contractService as any).accessManager.getRegisteredContracts = getRegisteredContracts;
        const result = await contractService.registeredContracts();

        expect(getRegisteredContracts).toHaveBeenCalled();
        expect(result).toHaveProperty(keccak256(toUtf8Bytes("AccessManager")))
    });
});

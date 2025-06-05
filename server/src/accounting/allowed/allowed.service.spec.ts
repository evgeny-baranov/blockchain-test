import {Test, TestingModule} from '@nestjs/testing';
import {AllowedService} from './allowed.service';
import {ChainContractsService} from '../../chain-contracts/chain-contracts.service';
import {MockChainContractsService} from "../../__mock__/chain-contract-service.mock";
import {mockRevertAccessManagerUnauthorizedAccount} from "../../__mock__/errors.mock";
import {BadRequestException} from "@nestjs/common";

describe('AllowedService', () => {
    const mockContainer = 'container';
    const address = '0xdeadbeef00000000000000000000000000000001';

    let allowedService: AllowedService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AllowedService,
                {
                    provide: ChainContractsService,
                    useValue: new MockChainContractsService()
                },
            ]
        }).compile();

        allowedService = module.get<AllowedService>(AllowedService);
        allowedService.onModuleInit();
    });

    it('should return allowed tokens', async () => {
        const fnGetContractAddress = jest.fn().mockResolvedValue(address);
        (allowedService as any).chainContractsService.getContractAddress = fnGetContractAddress;

        const result = await allowedService.getAllowedTokens(mockContainer);

        expect(fnGetContractAddress).toHaveBeenCalledWith(mockContainer)
        expect(result.some(r => r.symbol === 'TKN1')).toBe(true);
        expect(result.some(r => r.symbol === 'TKN2')).toBe(true);
    });

    it('throws an error when getAllowedTokens fails', async () => {
        const fnGetContractAddress = jest.fn().mockResolvedValue(address);
        (allowedService as any).chainContractsService.getContractAddress = fnGetContractAddress;

        (allowedService as any).accounting.containerAllowedTokens = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                address
            )
        );

        await expect(
            allowedService.getAllowedTokens(mockContainer)
        ).rejects.toThrow(BadRequestException);

        expect(fnGetContractAddress).toHaveBeenCalledWith(mockContainer);
    });

    it('mocks getContractAddress to return a specific address', () => {
        const fnGetContractAddress = jest.fn().mockReturnValue(address);
        (allowedService as any).chainContractsService.getContractAddress = fnGetContractAddress;

        const result = (allowedService as any).chainContractsService.getContractAddress('Accounting');

        expect(fnGetContractAddress).toHaveBeenCalledWith('Accounting');
        expect(result).toBe(address);
    });

    it('adds a container allowed token successfully', async () => {
        const mockCreditAsset = '0xMockCreditAsset';

        const fnGetContractAddress = jest.fn().mockReturnValue(address);
        (allowedService as any).chainContractsService.getContractAddress = fnGetContractAddress;

        const fnAddContainerAllowedToken = jest.fn();
        (allowedService as any).accounting.addContainerAllowedToken = fnAddContainerAllowedToken;

        await allowedService.addContainerAllowedToken(mockContainer, mockCreditAsset);

        expect(fnGetContractAddress).toHaveBeenCalledWith(mockContainer);
        expect(fnAddContainerAllowedToken).toHaveBeenCalledWith(address, mockCreditAsset);
    });

    it('throws an error when addContainerAllowedToken fails', async () => {
        const mockCreditAsset = '0xMockCreditAsset';

        const fnGetContractAddress = jest.fn().mockResolvedValue(address);
        (allowedService as any).chainContractsService.getContractAddress = fnGetContractAddress;

        (allowedService as any).accounting.addContainerAllowedToken = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                address
            )
        );

        await expect(
            allowedService.addContainerAllowedToken(mockContainer, mockCreditAsset)
        ).rejects.toThrow(BadRequestException);

        expect(fnGetContractAddress).toHaveBeenCalledWith(mockContainer);
    });

    it('removes an allowed token successfully', async () => {
        const mockCreditAsset = '0xMockCreditAsset';

        const fnGetContractAddress = jest.fn().mockReturnValue(address);
        (allowedService as any).chainContractsService.getContractAddress = fnGetContractAddress;

        const fnRemoveContainerAllowedToken = jest.fn();
        (allowedService as any).accounting.removeContainerAllowedToken = fnRemoveContainerAllowedToken;

        await allowedService.removeAllowedToken(mockContainer, mockCreditAsset);

        expect(fnGetContractAddress).toHaveBeenCalledWith(mockContainer);
        expect(fnRemoveContainerAllowedToken).toHaveBeenCalledWith(address, mockCreditAsset);
    });

    it('throws an error when removeAllowedToken fails', async () => {
        const mockCreditAsset = '0xMockCreditAsset';
        const fnGetContractAddress = jest.fn().mockResolvedValue(address);
        (allowedService as any).chainContractsService.getContractAddress = fnGetContractAddress;

        (allowedService as any).accounting.removeContainerAllowedToken = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                address
            )
        );

        await expect(
            allowedService.removeAllowedToken(mockContainer, mockCreditAsset)
        ).rejects.toThrow(BadRequestException);
        expect(fnGetContractAddress).toHaveBeenCalledWith(mockContainer);
    });
});

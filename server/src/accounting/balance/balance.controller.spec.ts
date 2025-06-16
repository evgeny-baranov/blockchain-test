import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { AddressLike, BigNumberish } from 'ethers';
import { Currency } from '../../types/currency.type';

describe('BalanceController', () => {
    let balanceController: BalanceController;
    let balanceService: BalanceService;

    const mockBalanceService = {
        getBalance: jest.fn(),
        mintToken: jest.fn(),
        burnToken: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BalanceController],
            providers: [
                {
                    provide: BalanceService,
                    useValue: mockBalanceService,
                },
            ],
        }).compile();

        balanceController = module.get<BalanceController>(BalanceController);
        balanceService = module.get<BalanceService>(BalanceService);
    });

    it('should return balance for a valid container', async () => {
        const mockContainer: AddressLike = '0xabc123';
        const mockBalance = { usd: 100n, eur: 200n };

        mockBalanceService.getBalance.mockResolvedValue(mockBalance);

        const result = await balanceController.getBalance(mockContainer);

        expect(balanceService.getBalance).toHaveBeenCalledWith(mockContainer);
        expect(result).toEqual(mockBalance);
    });

    it('should mint token to container', async () => {
        const mockContainer: AddressLike = '0xabc123';
        const mockCurrency: Currency = 'usd';
        const mockAmount: BigNumberish = 100n;
        const expectedResponse = { success: true };

        mockBalanceService.mintToken.mockResolvedValue(expectedResponse);

        const result = await balanceController.mintToken(mockCurrency, mockContainer, mockAmount);

        expect(balanceService.mintToken).toHaveBeenCalledWith(mockContainer, mockCurrency, mockAmount);
        expect(result).toEqual(expectedResponse);
    });

    it('should burn token from container', async () => {
        const mockContainer: AddressLike = '0xabc123';
        const mockCurrency: Currency = 'eur';
        const mockAmount: BigNumberish = 50n;
        const expectedResponse = { success: true };

        mockBalanceService.burnToken.mockResolvedValue(expectedResponse);

        const result = await balanceController.burnToken(mockCurrency, mockContainer, mockAmount);

        expect(balanceService.burnToken).toHaveBeenCalledWith(mockContainer, mockCurrency, mockAmount);
        expect(result).toEqual(expectedResponse);
    });
});

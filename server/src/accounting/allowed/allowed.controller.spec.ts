import {Test, TestingModule} from '@nestjs/testing';
import {AllowedController} from './allowed.controller';
import {AllowedService} from './allowed.service';

describe('AllowedController', () => {
    let allowedController: AllowedController;
    let allowedService: AllowedService;

    const mockAllowedService = {
        getAllowedTokens: jest.fn(),
        addContainerAllowedToken: jest.fn(),
        removeAllowedToken: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AllowedController],
            providers: [
                {
                    provide: AllowedService,
                    useValue: mockAllowedService,
                },
            ],
        }).compile();

        allowedController = module.get<AllowedController>(AllowedController);
        allowedService = module.get<AllowedService>(AllowedService);
    });

    it('returns allowed tokens for a valid container', async () => {
        const mockContainer = 'validContainer';
        const mockTokens = [{ symbol: 'TKN1' }, { symbol: 'TKN2' }];
        mockAllowedService.getAllowedTokens.mockResolvedValue(mockTokens);

        const result = await allowedController.getContainerAllowedTokens(mockContainer);

        expect(mockAllowedService.getAllowedTokens).toHaveBeenCalledWith(mockContainer);
        expect(result).toEqual(mockTokens);
    });

    it('adds an allowed token for a valid container and credit asset', async () => {
        const mockContainer = 'validContainer';
        const mockCreditAsset = '0xMockCreditAsset';
        mockAllowedService.addContainerAllowedToken.mockResolvedValue(undefined);

        const result = await allowedController.addAllowedToken(mockContainer, mockCreditAsset);

        expect(mockAllowedService.addContainerAllowedToken).toHaveBeenCalledWith(mockContainer, mockCreditAsset);
        expect(result).toBeUndefined();
    });

    it('removes an allowed token for a valid container and credit asset', async () => {
        const mockContainer = 'validContainer';
        const mockCreditAsset = '0xMockCreditAsset';
        mockAllowedService.removeAllowedToken.mockResolvedValue(undefined);

        const result = await allowedController.removeAllowedToken(mockContainer, mockCreditAsset);

        expect(mockAllowedService.removeAllowedToken).toHaveBeenCalledWith(mockContainer, mockCreditAsset);
        expect(result).toBeUndefined();
    });
});
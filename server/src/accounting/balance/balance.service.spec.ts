import {Test, TestingModule} from "@nestjs/testing";
import {ChainContractsService} from "../../chain-contracts/chain-contracts.service";
import {MockChainContractsService} from "../../__mock__/chain-contract-service.mock";
import {BalanceService} from "./balance.service";
import {mockSignerPublicAddress, MockSignerService} from "../../__mock__/signer-service.mock";
import {SignerService} from "../../signer/signer.service";
import {MockEurToken} from "../../__mock__/eur.mock";
import {AddressLike} from "ethers";
import {MockUsdToken} from "../../__mock__/usd.mock";
import {mockRevertAccessManagerUnauthorizedAccount} from "../../__mock__/errors.mock";
import {BadRequestException} from "@nestjs/common";

describe('BalanceService', () => {
    const container = 'container';
    const euroToken = new MockEurToken();
    const usdToken = new MockUsdToken();
    const eurBalance = 123n;
    const usdBalance = 321n;
    let service: BalanceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BalanceService,
                {
                    provide: ChainContractsService,
                    useValue: new MockChainContractsService()
                },
                {
                    provide: SignerService,
                    useValue: new MockSignerService()
                },
            ]
        }).compile();

        service = module.get<BalanceService>(BalanceService);
    });

    it('should get balance for a container address', async () => {
        const eurBalanceOf = jest.fn<bigint, [AddressLike]>().mockReturnValue(eurBalance);
        const usdBalanceOf = jest.fn<bigint, [AddressLike]>().mockReturnValue(usdBalance);

        (usdToken as any).balanceOf = usdBalanceOf;
        (euroToken as any).balanceOf = eurBalanceOf;

        (service as any).chainContractsService.getCurrencyContract = jest.fn((currency: string) => {
            if (currency === 'usd') {
                return usdToken;
            }
            if (currency === 'eur') {
                return euroToken;
            }
            throw new Error(`Unknown currency: ${currency}`);
        });

        const result = await service.getBalance(container);

        expect(eurBalanceOf).toHaveBeenCalledWith(container);
        expect(usdBalanceOf).toHaveBeenCalledWith(container);

        expect(result.usd).toBe(usdBalance);
        expect(result.eur).toBe(eurBalance);
    });

    it('should handle error while getting balance for a container address', async () => {
        const usdBalanceOf = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                mockSignerPublicAddress
            )
        );

        const eurBalanceOf = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                mockSignerPublicAddress
            )
        );

        (usdToken as any).balanceOf = usdBalanceOf;
        (euroToken as any).balanceOf = eurBalanceOf;

        (service as any).chainContractsService.getCurrencyContract = jest.fn((currency: string) => {
            if (currency === 'usd') {
                return usdToken;
            }
            if (currency === 'eur') {
                return euroToken;
            }
            throw new Error(`Unknown currency: ${currency}`);
        });

        await expect(
            service.getBalance(container)
        ).rejects.toThrow(BadRequestException);

        expect(usdBalanceOf).toHaveBeenCalledWith(container);
    });

    it('should mint a token to a wallet', async () => {
        const usdMintTo = jest.fn();
        const eurMintTo = jest.fn();

        (usdToken as any).mintTo = usdMintTo;
        (euroToken as any).mintTo = eurMintTo;

        (service as any).chainContractsService.getCurrencyContract = jest.fn((currency: string) => {
            if (currency === 'usd') {
                return usdToken;
            }
            if (currency === 'eur') {
                return euroToken;
            }
            throw new Error(`Unknown currency: ${currency}`);
        });

        await service.mintToken(container, 'usd', usdBalance);
        await service.mintToken(container, 'eur', eurBalance);

        expect(usdMintTo).toHaveBeenCalledWith(container, usdBalance);
        expect(eurMintTo).toHaveBeenCalledWith(container, eurBalance);
    });

    it('should handle error while minting token', async () => {
        const usdMintTo = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                mockSignerPublicAddress
            )
        );
        (usdToken as any).mintTo = usdMintTo;

        (service as any).chainContractsService.getCurrencyContract = jest.fn((currency: string) => {
            if (currency === 'usd') {
                return usdToken;
            }
            throw new Error(`Unknown currency: ${currency}`);
        });

        await expect(
            service.mintToken(container, 'usd', usdBalance)
        ).rejects.toThrow(BadRequestException);

        expect(usdMintTo).toHaveBeenCalledWith(container, usdBalance);
    });

    it('should burn a token from a wallet', async () => {
        const usdBurnFrom = jest.fn();
        const eurBurnFrom = jest.fn();

        const usdAllowance = jest.fn().mockResolvedValue(100n);
        const eurAllowance = jest.fn().mockResolvedValue(100n);

        const wait = jest.fn();
        const usdApprove = jest.fn().mockReturnValue({wait});
        const eurApprove = jest.fn().mockReturnValue({wait});

        Object.assign((usdToken as any), {
                burnFrom: usdBurnFrom,
                allowance: usdAllowance,
                approve: usdApprove
            }
        );

        Object.assign((euroToken as any), {
                burnFrom: eurBurnFrom,
                allowance: eurAllowance,
                approve: eurApprove
            }
        );

        // (service as any).signerService
        (service as any).chainContractsService.getCurrencyContract = jest.fn((currency: string) => {
            if (currency === 'usd') {
                return usdToken;
            }
            if (currency === 'eur') {
                return euroToken;
            }
            throw new Error(`Unknown currency: ${currency}`);
        });

        await service.burnToken(container, 'usd', usdBalance);
        await service.burnToken(container, 'eur', eurBalance);

        expect(wait).toHaveBeenCalledTimes(2);

        expect(usdApprove).toHaveBeenCalledWith(mockSignerPublicAddress, usdBalance - 100n);
        expect(eurApprove).toHaveBeenCalledWith(mockSignerPublicAddress, eurBalance - 100n);

        expect(usdBurnFrom).toHaveBeenCalledWith(container, usdBalance);
        expect(eurBurnFrom).toHaveBeenCalledWith(container, eurBalance);
    });

    it('should handle error while get allowance burning token', async () => {
        const usdBurnFrom = jest.fn();

        const usdAllowance = jest.fn().mockResolvedValue(100n);

        const wait = jest.fn();
        const usdApprove = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                mockSignerPublicAddress
            )
        );

        Object.assign((usdToken as any), {
                burnFrom: usdBurnFrom,
                allowance: usdAllowance,
                approve: usdApprove
            }
        );

        (service as any).chainContractsService.getCurrencyContract = jest.fn((currency: string) => {
            if (currency === 'usd') {
                return usdToken;
            }

            throw new Error(`Unknown currency: ${currency}`);
        });

        await expect(
            service.burnToken(container, 'usd', usdBalance)
        ).rejects.toThrow(BadRequestException);

        expect(wait).toHaveBeenCalledTimes(0);
        expect(usdBurnFrom).toHaveBeenCalledTimes(0);
    });

    it('should handle error while burning token', async () => {
        const usdBurnFrom = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                mockSignerPublicAddress
            )
        );

        const usdAllowance = jest.fn().mockResolvedValue(100n);

        const wait = jest.fn();
        const usdApprove = jest.fn().mockReturnValue({wait});

        Object.assign((usdToken as any), {
                burnFrom: usdBurnFrom,
                allowance: usdAllowance,
                approve: usdApprove
            }
        );

        (service as any).chainContractsService.getCurrencyContract = jest.fn((currency: string) => {
            if (currency === 'usd') {
                return usdToken;
            }

            throw new Error(`Unknown currency: ${currency}`);
        });

        await expect(
            service.burnToken(container, 'usd', usdBalance)
        ).rejects.toThrow(BadRequestException);

        expect(wait).toHaveBeenCalledTimes(1);
        expect(usdApprove).toHaveBeenCalledWith(mockSignerPublicAddress, usdBalance - 100n);
        expect(usdBurnFrom).toHaveBeenCalledWith(container, usdBalance);
    });
});

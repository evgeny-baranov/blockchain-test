import {Injectable} from '@nestjs/common';
import {AddressLike, BigNumberish} from "ethers";
import {ChainContractsService} from "../../chain-contracts/chain-contracts.service";
import {SignerService} from "../../signer/signer.service";
import {handleSmartContractError} from "../../errors/handle-smart-contract-errors";
import {Currency} from "../../types/currency.type";

@Injectable()
export class BalanceService {

    constructor(
        private readonly chainContractsService: ChainContractsService,
        private readonly signerService: SignerService,
    ) {
    }

    async getBalance(container: AddressLike) {
        const usd = await this.chainContractsService.getCurrencyContract('usd');
        const eur = await this.chainContractsService.getCurrencyContract('eur');

        try {
            return {
                usd: await usd.balanceOf(container),
                eur: await eur.balanceOf(container),
                eth: await this.signerService.getSignerWallet().provider?.getBalance(container),
            };
        } catch (error: any) {
            handleSmartContractError(eur.interface, error);
        }
    }

    async mintToken(
        container: AddressLike,
        currency: Currency,
        amount: BigNumberish
    ) {
        const contract = await this.chainContractsService.getCurrencyContract(currency);

        try {
            contract.mintTo(container, amount);
        } catch (error: any) {
            handleSmartContractError(contract.interface, error);
        }
    }

    async burnToken(container: AddressLike, currency: Currency, amount: BigNumberish) {
        const contract = await this.chainContractsService.getCurrencyContract(currency);
        const signerAddress = this.signerService.getSignerWallet().address;

        const allowance = await contract.allowance(
            container,
            signerAddress
        );

        if (allowance < BigInt(amount)) {
            try {
                const approveTx = await contract.approve(
                    signerAddress,
                    amount
                );
                await approveTx.wait();
            } catch (error: any) {
                handleSmartContractError(contract.interface, error);
            }
        }

        try {
            await contract.burnFrom(container, amount);
        } catch (error: any) {
            handleSmartContractError(contract.interface, error);
        }
    }
}

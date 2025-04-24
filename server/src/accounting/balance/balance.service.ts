import {Injectable} from '@nestjs/common';
import {AddressLike, BigNumberish} from "ethers";
import {ChainContractsService} from "../../chain-contracts/chain-contracts.service";
import {SignerService} from "../../signer/signer.service";

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
            if (error.code === 'CALL_EXCEPTION' && error.data) {
                const decoded = usd.interface.parseError(error.data);
                console.log("Custom error:", decoded?.name, decoded?.args);
                throw new Error(`Transaction reverted with error: ${decoded?.name}`);
            }

            throw error;
        }
    }

    async mintToken(
        container: AddressLike,
        currency: "usd" | "eur",
        amount: BigNumberish
    ) {
        const contract = await this.chainContractsService.getCurrencyContract(currency);

        try {
            contract.mintTo(container, amount);
        } catch (error: any) {
            if (error.code === 'CALL_EXCEPTION' && error.data) {
                const decoded = contract.interface.parseError(error.data);
                console.log("Custom error:", decoded?.name, decoded?.args);
                throw new Error(`Transaction reverted with error: ${decoded?.name}`);
            }

            throw error;
        }
    }

    async burnToken(container: AddressLike, currency: "usd" | "eur", amount: BigNumberish) {
        const contract = await this.chainContractsService.getCurrencyContract(currency);
        const signerAddress = this.signerService.getSignerWallet().address;

        const allowance = await contract.allowance(
            container,
            signerAddress
        );

        if (allowance < BigInt(amount)) {
            const approveTx = await contract.approve(
                signerAddress,
                amount
            );
            await approveTx.wait();
        }

        try {
            await contract.burnFrom(container, amount);
        } catch (error: any) {
            if (error.code === 'CALL_EXCEPTION' && error.data) {
                const decoded = contract.interface.parseError(error.data);
                console.log("Custom error:", decoded?.name, decoded?.args);
                throw new Error(`Transaction reverted with error: ${decoded?.name}`);
            }

            throw error;
        }
    }
}

import {Injectable} from '@nestjs/common';
import {AddressLike, BigNumberish} from "ethers";
import {ChainContractsService} from "../chain-contracts/chain-contracts.service";
import {SignerService} from "../signer/signer.service";
import {IERC20BaseToken} from "@blockchain/contracts/tokens";

@Injectable()
export class AccountingService {

    constructor(
        private readonly chainContractsService: ChainContractsService,
        private readonly signerService: SignerService,
    ) {
    }

    async getBalance(container: AddressLike) {
        const usd = await this.chainContractsService.getCurrencyContract('usd');
        const eur = await this.chainContractsService.getCurrencyContract('eur');

        return {
            usd: await usd.balanceOf(container),
            eur: await eur.balanceOf(container),
            eth: await this.signerService.getSignerWallet().provider?.getBalance(container),
        };
    }

    async mintToken(
        container: AddressLike,
        currency: "usd" | "eur",
        amount: BigNumberish
    ) {
        const contract = await this.chainContractsService.getCurrencyContract(currency);

        return contract.mintTo(container, amount);
    }

    async burnToken(container: AddressLike, currency: "usd" | "eur", amount: BigNumberish) {
        const contract = await this.chainContractsService.getCurrencyContract(currency);

        return contract.burnFrom(container, amount);
    }
}

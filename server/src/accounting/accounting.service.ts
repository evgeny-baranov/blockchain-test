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

    async getContract(currency: string): Promise<IERC20BaseToken> {
        switch (currency) {
            case 'usd':
                return this.chainContractsService.usdContract;
            case 'eur':
                return this.chainContractsService.euroContract;
            default:
                throw new Error(`Currency ${currency} is not supported`);
        }
    }
    async getBalance(container: AddressLike) {
        const usd = await this.getContract('usd');
        const eur = await this.getContract('eur');
        return {
            usd: await usd.balanceOf(container),
            eur: await eur.balanceOf(container),
            eth: await this.signerService.getSignerWallet().provider?.getBalance(container),
        };
    }

    async mintToken(currency: string, to: AddressLike, amount: BigNumberish) {
        const contract = await this.getContract(currency);
        return contract.mintTo(to, amount);
    }
}

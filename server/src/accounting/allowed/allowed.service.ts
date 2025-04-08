import {Injectable} from '@nestjs/common';
import {AddressLike} from "ethers";
import {ChainContractsService} from "../../chain-contracts/chain-contracts.service";
import {ICommissionContainer} from '@blockchain/contracts/utils/commission-container';

@Injectable()
export class AllowedService {

    constructor(
        private readonly chainContractsService: ChainContractsService,
    ) {
    }

    async getAllowedTokens(container: string) {
        const contractAddress = this.chainContractsService.getContractAddress(container);

        const allowed = await this.chainContractsService.accountingContract.containerAllowedTokens(
            contractAddress
        );

        return allowed.map(
            ([token,
                 name,
                 symbol,
                 decimals
             ]) => ({
                token,
                name,
                symbol,
                decimals
            } as ICommissionContainer.TokenDataStruct)
        );
    }

    addContainerAllowedToken(container: string, creditAsset: AddressLike) {
        const containerAddress = this.chainContractsService.getContractAddress(container);

        this.chainContractsService.accountingContract.addContainerAllowedToken(
            containerAddress,
            creditAsset
        );
    }

    removeAllowedToken(container: string, creditAsset: AddressLike) {
        const contractAddress = this.chainContractsService.getContractAddress(container);

        this.chainContractsService.accountingContract.removeContainerAllowedToken(
            contractAddress,
            creditAsset
        );
    }
}
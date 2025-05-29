import {Injectable} from '@nestjs/common';
import {AddressLike} from 'ethers';
import {ChainContractsService} from '../../chain-contracts/chain-contracts.service';
import {ICommissionContainer} from '@blockchain/contracts/utils/commission-container';
import {handleSmartContractError} from '../../errors/handle-smart-contract-errors';

@Injectable()
export class AllowedService {
    constructor(
        private readonly chainContractsService: ChainContractsService
    ) {
    }

    async getAllowedTokens(container: string) {
        const contractAddress = this.chainContractsService.getContractAddress(container);

        const allowed =
            await this.chainContractsService.accountingContract.containerAllowedTokens(
                contractAddress,
            );

        return allowed.map(
            ([token, name, symbol, decimals]) =>
                ({
                    token,
                    name,
                    symbol,
                    decimals,
                }) as ICommissionContainer.TokenDataStruct,
        );
    }

    async addContainerAllowedToken(container: string, creditAsset: AddressLike) {
        const containerAddress = this.chainContractsService.getContractAddress(container);
        const contract = this.chainContractsService.accountingContract;

        try {
            await contract.addContainerAllowedToken(containerAddress, creditAsset);
        } catch (error: any) {
            handleSmartContractError(contract.interface, error);
        }
    }

    async removeAllowedToken(container: string, creditAsset: AddressLike) {
        const contractAddress = this.chainContractsService.getContractAddress(container);
        const contract = this.chainContractsService.accountingContract;

        try {
            await this.chainContractsService.accountingContract.removeContainerAllowedToken(
                contractAddress,
                creditAsset,
            );
        } catch (error: any) {
            handleSmartContractError(contract.interface, error);
        }
    }
}

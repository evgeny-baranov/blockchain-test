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
        const contract = this.chainContractsService.accountingContract;

        try {
            contract.addContainerAllowedToken(
                containerAddress,
                creditAsset
            );
        } catch (error: any) {
            if (error.code === 'CALL_EXCEPTION' && error.data) {
                const decoded = contract.interface.parseError(error.data);
                console.log("Custom error:", decoded?.name, decoded?.args);
                throw new Error(`Transaction reverted with error: ${decoded?.name}`);
            }

            throw error;
        }
    }

    removeAllowedToken(container: string, creditAsset: AddressLike) {
        const contractAddress = this.chainContractsService.getContractAddress(container);
        const contract = this.chainContractsService.accountingContract;

        try {
            this.chainContractsService.accountingContract.removeContainerAllowedToken(
                contractAddress,
                creditAsset
            );
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
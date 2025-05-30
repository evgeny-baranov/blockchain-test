import {Injectable, OnModuleInit} from '@nestjs/common';
import {AddressLike} from 'ethers';
import {Accounting} from '@blockchain/contracts';
import {ChainContractsService} from '../../chain-contracts/chain-contracts.service';
import {ICommissionContainer} from '@blockchain/contracts/utils/commission-container';
import {handleSmartContractError} from '../../errors/handle-smart-contract-errors';

@Injectable()
export class AllowedService implements OnModuleInit {
    private accounting!: Accounting;

    constructor(
        private readonly chainContractsService: ChainContractsService
    ) {
    }

    onModuleInit() {
        this.accounting = this.chainContractsService.accountingContract;
    }

    async getAllowedTokens(container: string) {
        const contractAddress = this.chainContractsService.getContractAddress(container);

        try {
            const allowed = await this.accounting.containerAllowedTokens(
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
        } catch (error: any) {
            handleSmartContractError(this.accounting.interface, error);
        }
    }

    async addContainerAllowedToken(container: string, creditAsset: AddressLike) {
        const containerAddress = this.chainContractsService.getContractAddress(container);

        try {
            await this.accounting.addContainerAllowedToken(containerAddress, creditAsset);
        } catch (error: any) {
            handleSmartContractError(this.accounting.interface, error);
        }
    }

    async removeAllowedToken(container: string, creditAsset: AddressLike) {
        const contractAddress = this.chainContractsService.getContractAddress(container);

        try {
            await this.accounting.removeContainerAllowedToken(
                contractAddress,
                creditAsset,
            );
        } catch (error: any) {
            handleSmartContractError(this.accounting.interface, error);
        }
    }
}

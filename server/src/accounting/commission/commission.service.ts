import {Injectable, OnModuleInit} from '@nestjs/common';
import {AddressLike} from 'ethers';
import {Accounting} from '@blockchain/contracts';
import {ChainContractsService} from '../../chain-contracts/chain-contracts.service';
import {handleSmartContractError} from "../../errors/handle-smart-contract-errors";

@Injectable()
export class CommissionService implements OnModuleInit {
    private accounting!: Accounting;
    constructor(
        private readonly chainContractsService: ChainContractsService
    ) {
    }

    onModuleInit() {
        this.accounting = this.chainContractsService.accountingContract;
    }

    async withdrawCommission(
        container: string,
        currency: string,
        to: AddressLike,
    ) {
        const containerAddress = this.chainContractsService.getContractAddress(container);
        const asset = await this.chainContractsService.getCurrencyContract(currency);

        try {
            await this.accounting.withdrawContainerCommission(
                containerAddress,
                await asset.getAddress(),
                to,
            );
        } catch (error: any) {
            handleSmartContractError(this.accounting.interface, error);
        }
    }

    async getCommission(container: string, currency: string) {
        const containerAddress = this.chainContractsService.getContractAddress(container);
        const asset = await this.chainContractsService.getCurrencyContract(currency);

        try {
            return this.accounting.containerCommissionAmount(
                containerAddress,
                await asset.getAddress(),
            );
        } catch (error: any) {
            handleSmartContractError(this.accounting.interface, error);
        }
    }

    async updateCommissionPercent(container: string, commissionPercent: number) {
        const containerAddress = this.chainContractsService.getContractAddress(container);

        try {
            await this.accounting.updateContainerCommissionPercent(
                containerAddress,
                commissionPercent,
            );
        } catch (error: any) {
            handleSmartContractError(this.accounting.interface, error);
        }
    }

    getCommissionPercent(container: string) {
        const containerAddress = this.chainContractsService.getContractAddress(container);

        try {
            return this.accounting.containerCommissionPercent(containerAddress);
        } catch (error: any) {
            handleSmartContractError(this.accounting.interface, error);
        }
    }
}

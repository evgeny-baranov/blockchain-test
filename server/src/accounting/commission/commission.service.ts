import {Injectable} from '@nestjs/common';
import {AddressLike} from "ethers";
import {ChainContractsService} from "../../chain-contracts/chain-contracts.service";

@Injectable()
export class CommissionService {
    constructor(
        private readonly chainContractsService: ChainContractsService,
    ) {
    }

    async withdrawCommission(container: string, currency: string, to: AddressLike) {
        const accounting = this.chainContractsService.accountingContract;
        const containerAddress = this.chainContractsService.getContractAddress(container);
        const asset = await this.chainContractsService.getCurrencyContract(currency);

        await accounting.withdrawContainerCommission(
            containerAddress,
            await asset.getAddress(),
            to
        );
    }

    async getCommission(container: string, currency: string) {
        const accounting = this.chainContractsService.accountingContract;
        const containerAddress = this.chainContractsService.getContractAddress(container);
        const asset = await this.chainContractsService.getCurrencyContract(currency);

        return accounting.containerCommissionAmount(
            containerAddress,
            await asset.getAddress(),
        )
    }

    async updateCommissionPercent(container: string, commissionPercent: number) {
        const accounting = this.chainContractsService.accountingContract;
        const containerAddress = this.chainContractsService.getContractAddress(container);

        await accounting.updateContainerCommissionPercent(
            containerAddress,
            commissionPercent
        )
    }

    getCommissionPercent(container: string) {
        const accounting = this.chainContractsService.accountingContract;
        const containerAddress = this.chainContractsService.getContractAddress(container);

        return accounting.containerCommissionPercent(
            containerAddress
        )
    }
}

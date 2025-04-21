import {Injectable, OnModuleInit} from '@nestjs/common';
import {AccessManager} from '@blockchain/contracts';
import {AddressLike} from "ethers";
import {ChainContractsService} from "../chain-contracts/chain-contracts.service";

@Injectable()
export class ContractService implements OnModuleInit {
    private accessManager!: AccessManager;

    constructor(
        private readonly chainContractsService: ChainContractsService
    ) {
    }

    onModuleInit(): any {
        this.accessManager = this.chainContractsService.accessManagerContract;
    }

    async getContract(name: string): Promise<AddressLike> {
        return await this.accessManager.getContract(name)
    }

    async registeredContracts() {
        const [names, addresses] = await this.accessManager.getRegisteredContracts();
        const contractMap = new Map<string, string>();

        names.forEach((name: string, index: number) => {
            contractMap.set(name, addresses[index]);
        });

        return Object.fromEntries(contractMap);
    }
}

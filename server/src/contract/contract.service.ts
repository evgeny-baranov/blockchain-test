import {Injectable, OnModuleInit} from '@nestjs/common';
import assert from "assert";
import {AccessManager__factory} from '@blockchain/factories/contracts';
import {SignerService} from "../signer/signer.service";
import {AccessManager} from '@blockchain/contracts';
import {ConfigService} from "@nestjs/config";
import {AddressLike} from "ethers";

@Injectable()
export class ContractService implements OnModuleInit {
    private contract!: AccessManager;
    private readonly contractAddress!: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly signerService: SignerService,
    ) {
        const contractAddress = this.configService.get<string>('ADDRESS_ACCESS_MANAGER');
        assert(contractAddress, "ADDRESS_ACCESS_MANAGER not set");
        this.contractAddress = contractAddress;
    }

    onModuleInit(): any {
        this.contract = AccessManager__factory.connect(
            this.contractAddress,
            this.signerService.getSignerWallet()
        );
    }

    async getContract(name: string): Promise<AddressLike> {
        return await this.contract.getContract(name)
    }

    async registeredContracts() {
        const [names, addresses] = await this.contract.getRegisteredContracts();
        const contractMap = new Map<string, string>();

        names.forEach((name: string, index: number) => {
            contractMap.set(name, addresses[index]);
        });

        return Object.fromEntries(contractMap);
    }
}

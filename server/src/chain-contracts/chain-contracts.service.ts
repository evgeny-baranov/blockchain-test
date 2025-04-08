import {Injectable, OnModuleInit} from "@nestjs/common";
import assert from "assert";
import * as fs from "node:fs";
import * as path from "node:path";
import {
    Accounting__factory,
    AuctionLot__factory,
    Auction__factory,
    EuroToken__factory,
    UsdToken__factory,
    AccessManager__factory,
} from '@blockchain/factories/contracts';
import {SignerService} from "../signer/signer.service";
import {
    Accounting,
    Auction,
    AuctionLot,
    EuroToken,
    UsdToken,
    AccessManager
} from '@blockchain/contracts';

@Injectable()
export class ChainContractsService implements OnModuleInit {
    private readonly chainId: number;
    private addresses!: Record<string, string>;

    constructor(
        private readonly signerService: SignerService,
    ) {
        const chainId = process.env.CHAIN_ID;
        assert(chainId, "CHAIN_ID not set");
        const parsedChainId = Number(chainId);
        assert(!isNaN(parsedChainId), "CHAIN_ID must be a number");

        this.chainId = parsedChainId;
    }

    get accessManagerContract(): AccessManager {
        return AccessManager__factory.connect(
            this.getContractAddress("AccessManager"),
            this.signerService.getSignerWallet()
        );
    }

    get euroContract(): EuroToken {
        return EuroToken__factory.connect(
            this.getContractAddress("EuroToken"),
            this.signerService.getSignerWallet()
        );
    }

    get usdContract(): UsdToken {
        return UsdToken__factory.connect(
            this.getContractAddress("UsdToken"),
            this.signerService.getSignerWallet()
        );
    }

    get auctionContract(): Auction {
        return Auction__factory.connect(
            this.getContractAddress("Auction"),
            this.signerService.getSignerWallet()
        );
    }

    get accountingContract(): Accounting {
        return Accounting__factory.connect(
            this.getContractAddress("Accounting"),
            this.signerService.getSignerWallet()
        );
    }

    get auctionLotContract(): AuctionLot {
        return AuctionLot__factory.connect(
            this.getContractAddress("AuctionLot"),
            this.signerService.getSignerWallet()
        );
    }

    async onModuleInit() {
        this.loadIgnitionResults();
    }

    getContractAddress(name: string): string {
        const address = this.addresses[name.toLowerCase()];
        assert(address, `Contract ${name} not found for chain ${this.chainId}`);
        console.log(`getContractAddress: ${name} => ${address}`);
        return address;
    }

    private loadIgnitionResults() {
        const fileName = `${this.chainId}-contracts.json`;
        const filePath = path.join('/blockchain/dist', fileName);
        assert(fs.existsSync(filePath), `Contract file not found: ${filePath}`);

        const raw = fs.readFileSync(filePath, 'utf-8');
        const rawContracts = JSON.parse(raw);

        this.addresses = Object.entries(rawContracts)
            .filter(([key]) => key.includes('Proxy'))
            .reduce<Record<string, string>>((acc, [fullKey, address]) => {
                const [, right] = fullKey.split('#');
                if (!right) return acc;

                const cleaned = right
                    .replace(/Proxy$/, '')
                    .replace(/V\d+$/, '');

                acc[cleaned.toLowerCase()] = address as string;
                return acc;
            }, {});

        console.log(`✅ Loaded proxied contracts for chain ${this.chainId}:`, this.addresses);
    }
}
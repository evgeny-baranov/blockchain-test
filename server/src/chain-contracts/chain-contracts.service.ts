import {Injectable, OnModuleInit} from "@nestjs/common";
import assert from "assert";
import * as fs from "node:fs";
import * as path from "node:path";
import {Auction__factory, AuctionLot__factory, EuroToken__factory} from '@blockchain/factories/contracts';
import {SignerService} from "../signer/signer.service";
import {Auction, AuctionLot, EuroToken} from '@blockchain/contracts';

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

    get euroContract(): EuroToken {
        return EuroToken__factory.connect(
            this.getContractAddress("EuroToken"),
            this.signerService.getSignerWallet()
        );
    }

    get auctionContract(): Auction {
        return Auction__factory.connect(
            this.getContractAddress("Auction"),
            this.signerService.getSignerWallet()
        );
    }

    get auctionLotContract(): AuctionLot {
        return AuctionLot__factory.connect(
            this.getContractAddress("AuctionLot"),
            this.signerService.getSignerWallet()
        );
    }

    onModuleInit() {
        this.loadIgnitionResults();
    }

    getContractAddress(name: string): string {
        const address = this.addresses[name];
        assert(address, `Contract ${name} not found for chain ${this.chainId}`);
        return address;
    }

    private loadIgnitionResults() {
        const fileName = `${this.chainId}-contracts.json`;
        const filePath = path.join('/blockchain/dist', fileName);
        assert(fs.existsSync(filePath), `Contract file not found: ${filePath}`);

        const raw = fs.readFileSync(filePath, 'utf-8');
        const rawContracts = JSON.parse(raw);

        this.addresses = Object.entries(rawContracts)
            .filter(([key]) => key.includes('Proxy')) // оставляем только прокси
            .reduce<Record<string, string>>((acc, [fullKey, address]) => {
                const [, right] = fullKey.split('#');
                if (!right) return acc;

                // Удаляем "Proxy" и версии
                const cleaned = right
                    .replace(/Proxy$/, '')
                    .replace(/V\d+$/, '');

                acc[cleaned] = address as string;
                return acc;
            }, {});

        console.log(`✅ Loaded proxied contracts for chain ${this.chainId}:`, this.addresses);
    }


}
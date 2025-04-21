import {Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {AddressLike} from "ethers";
import {Auction, AuctionLot, EuroToken} from '@blockchain/contracts';
import {IAuctionV1} from '@blockchain/contracts/auction/IAuctionV1';
import {SignerService} from "../signer/signer.service";
import {StartAuctionDto} from "../dto/start-auction.dto";
import {ChainContractsService} from "../chain-contracts/chain-contracts.service";


@Injectable()
export class AuctionService implements OnModuleInit {
    constructor(
        private readonly signerService: SignerService,
        private readonly chainContractsService: ChainContractsService,
    ) {
    }

    get auctionContract(): Auction {
        return this.chainContractsService.auctionContract;
    }

    get auctionLotContract(): AuctionLot {
        return this.chainContractsService.auctionLotContract;
    }

    get euroContract(): EuroToken {
        return this.chainContractsService.euroContract;
    }

    onModuleInit(): any {
        this.initContractEvents();
        this.initCommissionEvents();
    }

    createAuctionLot(uri: string) {
        return this.auctionContract.createAuctionLot(
            uri
        );
    }

    async getTokensOfOwner() {
        const address = await this.signerService.getSignerWallet().getAddress();
        const tokenIds: bigint[] = await this.auctionLotContract.getTokensOfOwner(address);

        return tokenIds.map(id => id.toString());
    }

    async getTokenInfo(tokenId: string) {
        try {
            const [owner, tokenURI, name, symbol, version, auctionId] = await Promise.all([
                this.auctionLotContract.ownerOf(tokenId),
                this.auctionLotContract.tokenURI(tokenId),
                this.auctionLotContract.name(),
                this.auctionLotContract.symbol(),
                this.auctionLotContract.version(),
                this.auctionContract.getAuctionId(
                    this.chainContractsService.getContractAddress('AuctionLot'),
                    tokenId
                ),
            ]);

            return {
                tokenId,
                auctionId,
                owner,
                tokenURI,
                name,
                symbol,
                version
            };
        } catch (e) {
            throw new NotFoundException(`Token with ID ${tokenId} not found`);
        }
    }

    async startAuction(dto: StartAuctionDto) {
        const currentApproved = await this.auctionLotContract.getApproved(dto.auctionLotId);
        const auctionContractAddress = this.chainContractsService.getContractAddress("Auction");
        const needApproval = currentApproved.toLowerCase() !== auctionContractAddress.toLowerCase();

        if (needApproval) {
            const tx = await this.auctionLotContract.approve(
                auctionContractAddress,
                dto.auctionLotId,
                {
                    gasLimit: 300_000
                }
            );

            await tx.wait();
        }
        dto.creditAsset = this.chainContractsService.getContractAddress("EuroToken");

        return await this.auctionContract.startAuction(
            dto.auctionLotId,
            dto.creditAsset ?? this.chainContractsService.getContractAddress("EuroToken"),
            dto.creditStartAmount,
            dto.creditEndAmount,
            dto.bidIncrement,
            dto.startTime,
            dto.duration,
            dto.claimDelay
        );
    }

    async placeBid(auctionId: string, amount: bigint) {
        try {
            const approveTx = await this.euroContract.approve(
                this.chainContractsService.getContractAddress('Auction'),
                amount
            );

            await approveTx.wait();

            return await this.auctionContract.placeBid(
                auctionId,
                amount
            );
        } catch (err: any) {
            const reason = err?.error?.data?.errorName || err?.error?.message || err?.message;
            console.error('Transaction failed:', reason);
            throw err;
        }
    }

    async getMyAuctions(): Promise<IAuctionV1.AuctionPoolDataStruct[]> {
        const address = await this.signerService.getSignerWallet().getAddress();
        const raw = await this.auctionContract.getAuctionsBySeller(address);

        return raw.map(
            item => this.mapAuctionArrayToStruct(item)
        );
    }

    private initCommissionEvents() {
        this.auctionContract.on(
            this.auctionContract.filters.CommissionDebited(),
            (creditAsset: string, to: string, amount: bigint) => {
                console.log('CommissionDebited:', creditAsset, to, amount);
            }
        );

        this.auctionContract.on(
            this.auctionContract.filters.CommissionCredited(),
            (creditAsset: string, amount: bigint) => {
                console.log('CommissionCredited:', creditAsset, amount);
            }
        );

        this.auctionContract.on(
            this.auctionContract.filters.CommissionTokenAdded(),
            (token: string) => {
                console.log('CommissionTokenAdded:', token);
            }
        );

        this.auctionContract.on(
            this.auctionContract.filters.CommissionTokenRemoved(),
            (token: string) => {
                console.log('CommissionTokenRemoved:', token);
            }
        );
    }

    private initContractEvents() {
        this.auctionContract.on(
            this.auctionContract.filters.AuctionBid(),
            (auctionId: bigint, bidder: AddressLike, amount: bigint) =>
                console.log('AuctionBid', auctionId, bidder, amount)
        );

        this.auctionContract.on(
            this.auctionContract.filters.AuctionClaimed(),
            (auctionId: bigint, seller: AddressLike, amount: bigint, commission: bigint) =>
                console.log('AuctionClaimed', auctionId, seller, amount, commission)
        );

        this.auctionContract.on(
            this.auctionContract.filters.AuctionCancelled(),
            (auctionId: bigint, seller: AddressLike) =>
                console.log('AuctionCancelled', auctionId, seller)
        );

        this.auctionContract.on(
            this.auctionContract.filters.AuctionLotReceived(),
            (operator: AddressLike, from: AddressLike, tokenId: bigint, data: string) =>
                console.log('AuctionLotReceived', operator, from, tokenId, data)
        );

        this.auctionContract.on(
            this.auctionContract.filters.AuctionCreated(),
            (auctionId: bigint, seller: AddressLike) =>
                console.log('AuctionCreated', auctionId, seller)
        );

        this.auctionContract.on(
            this.auctionContract.filters.AuctionClose(),
            (auctionId: bigint, bidder: AddressLike, amount: bigint) =>
                console.log('AuctionClose', auctionId, bidder, amount)
        );
    }

    private mapAuctionArrayToStruct(data: IAuctionV1.AuctionPoolDataStructOutput): IAuctionV1.AuctionPoolDataStruct {
        return {
            seller: data[0] as AddressLike,
            debitAsset: data[1] as AddressLike,
            debitAssetId: BigInt(data[2]),
            debitAmount: BigInt(data[3]),

            creditAsset: data[4] as AddressLike,
            creditStartAmount: BigInt(data[5]),
            creditEndAmount: BigInt(data[6]),

            highestBidder: data[7] as AddressLike,
            highestBid: BigInt(data[8]),

            bidIncrement: BigInt(data[9]),
            startTime: Number(data[10]),
            closeTime: Number(data[11]),

            claimDelay: Number(data[12]),
            claimed: Boolean(data[13]),
        };
    }
}

import {Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {AddressLike} from "ethers";
import {Auction, AuctionLot} from '@blockchain/contracts';
import {Auction__factory, AuctionLot__factory} from '@blockchain/factories/contracts';
import {SignerService} from "../signer/signer.service";
import assert from "assert";
import {StartAuctionDto} from "../dto/start-auction.dto";

@Injectable()
export class AuctionService implements OnModuleInit {
    private auctionContract!: Auction;
    private readonly auctionContractAddress: string;
    private auctionLotContract!: AuctionLot;
    private readonly auctionLotContractAddress: string;

    constructor(
        private readonly signerService: SignerService
    ) {
        const auctionContractAddress = process.env.ADDRESS_AUCTION;
        const auctionLotContractAddress = process.env.ADDRESS_AUCTION_LOT;

        assert(auctionContractAddress, "ADDRESS_AUCTION not set");
        assert(auctionLotContractAddress, "ADDRESS_AUCTION_LOT not set");

        this.auctionContractAddress = auctionContractAddress;
        this.auctionLotContractAddress = auctionLotContractAddress;
    }

    onModuleInit(): any {
        this.auctionContract = Auction__factory.connect(
            this.auctionContractAddress,
            this.signerService.getSignerWallet()
        );

        this.auctionLotContract = AuctionLot__factory.connect(
            this.auctionLotContractAddress,
            this.signerService.getSignerWallet()
        );

        // event AuctionBid(uint256 indexed auctionId, address indexed bidder, uint256 amount);
        // event AuctionClose(uint256 indexed auctionId, address indexed bidder, uint256 amount);
        this.auctionContract.on(
            this.auctionContract.filters.AuctionBid,
            (auctionId: bigint, bidder: AddressLike, amount: bigint) => console.log('AuctionBid', auctionId, bidder, amount)
        );

        this.auctionContract.on(
            this.auctionContract.filters.AuctionCreated,
            (auctionId: bigint, seller: AddressLike) => console.log('AuctionCreated', auctionId, seller)
        );

        this.auctionContract.on(
            this.auctionContract.filters.AuctionClose,
            (auctionId: bigint, bidder: AddressLike, amount: bigint) => console.log('AuctionClose', auctionId, bidder, amount)
        );
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
                this.auctionContract.getAuctionId(this.auctionLotContractAddress, tokenId),
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
        const needApproval = currentApproved.toLowerCase() !== this.auctionContractAddress.toLowerCase();

        if (needApproval) {
            const tx = await this.auctionLotContract.approve(
                this.auctionContractAddress,
                dto.auctionLotId,
                {
                    gasLimit: 300_000
                }
            );

            await tx.wait();
        }

        return await this.auctionContract.startAuction(
            dto.auctionLotId,
            dto.creditAsset ?? this.auctionLotContractAddress,
            dto.creditStartAmount,
            dto.creditEndAmount,
            dto.bidIncrement,
            dto.startTime,
            dto.duration,
            dto.claimDelay
        );
    }
}

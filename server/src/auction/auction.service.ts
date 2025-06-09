import {Injectable, OnModuleInit} from '@nestjs/common';
import {AddressLike, BigNumberish} from "ethers";
import {Auction, AuctionLot} from '@blockchain/contracts';
import {IAuctionStorage} from '@blockchain/contracts/Auction';
import {SignerService} from "../signer/signer.service";
import {AuctionStartDto} from "./dto/auction-start.dto";
import {ChainContractsService} from "../chain-contracts/chain-contracts.service";
import {AuctionInfoDto} from "./dto/auction-info.dto";
import {handleSmartContractError} from "../errors/handle-smart-contract-errors";


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

    onModuleInit(): any {
        this.initContractEvents();
        this.initCommissionEvents();
    }

    async startAuction(dto: AuctionStartDto) {
        const currentApproved = await this.auctionLotContract.getApproved(dto.auctionLotId);
        const auctionContractAddress = await this.auctionContract.getAddress();
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

        const creditAssetContract = this.chainContractsService.getCurrencyContract(dto.creditCurrency);

        try {
            await this.auctionContract.startAuction(
                dto.auctionLotId,
                await creditAssetContract.getAddress(),
                dto.creditStartAmount,
                dto.creditEndAmount,
                dto.bidIncrement,
                Math.floor(Date.now() / 1000),
                dto.duration,
                dto.claimDelay
            );
        } catch (error: any) {
            handleSmartContractError(this.auctionContract.interface, error);
        }
    }

    async cancelAuction(auctionId: BigNumberish) {
        try {
            await this.auctionContract.cancelAuction(
                auctionId
            );
        } catch (error: any) {
            handleSmartContractError(this.auctionContract.interface, error);
        }
    }

    async finaliseAuction(auctionId: BigNumberish) {
        try {
            await this.auctionContract.finaliseAuction(
                auctionId
            );
        } catch (error: any) {
            handleSmartContractError(this.auctionContract.interface, error);
        }
    }

    async getAuction(auctionId: BigNumberish) {
        const raw = await this.auctionContract.getAuction(
            auctionId
        );

        return this.mapAuctionArrayToStruct(raw);
    }

    async placeBid(auctionId: BigNumberish, amount: BigNumberish) {
        const auction = await this.getAuction(auctionId);

        const creditAssetContract = await this.chainContractsService.getCurrencyContractByAddress(
            auction.creditAsset
        );

        const userAddress = await this.signerService.publicAddress;
        const auctionAddress = await this.auctionContract.getAddress();

        const allowance = await creditAssetContract.allowance(userAddress, auctionAddress);
        if (allowance < BigInt(amount)) {
            try {
                const approveTx = await creditAssetContract.approve(auctionAddress, amount);
                await approveTx.wait();
            } catch (error: any) {
                return handleSmartContractError(creditAssetContract.interface, error);
            }
        }

        try {
            await this.auctionContract.placeBid(auctionId, amount);
        } catch (error: any) {
            handleSmartContractError(this.auctionContract.interface, error);
        }
    }

    async getMyAuctions() {
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

    private mapAuctionArrayToStruct(data: IAuctionStorage.AuctionPoolDataStructOutput): AuctionInfoDto {
        const {
            auctionId,
            seller,
            debitAsset,
            debitAssetId,
            debitAmount,
            creditAsset,
            creditStartAmount,
            creditEndAmount,
            highestBidder,
            highestBid,
            bidIncrement,
            startTime,
            closeTime,
            claimDelay,
            claimed
        } = data;

        const creditCurrency = this.chainContractsService.getCurrencyByAddress(creditAsset);

        const auctionPoolDataStruct: IAuctionStorage.AuctionPoolDataStruct = {
            auctionId,
            seller,
            debitAsset,
            debitAssetId,
            debitAmount,

            creditAsset,
            creditStartAmount,
            creditEndAmount,

            highestBidder,
            highestBid,

            bidIncrement,
            startTime,
            closeTime,

            claimDelay,
            claimed,
        } as IAuctionStorage.AuctionPoolDataStruct;

        return {
            creditCurrency,
            ...auctionPoolDataStruct
        } as AuctionInfoDto;
    }
}

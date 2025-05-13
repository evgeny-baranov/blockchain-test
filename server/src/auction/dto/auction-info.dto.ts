import {AddressLike, BigNumberish} from "ethers";
import {Currency} from "../../types/currency.type";

export class AuctionInfoDto {
    auctionId!: BigNumberish;
    seller!: AddressLike;
    debitAsset!: AddressLike;
    debitAssetId!: BigNumberish;
    debitAmount!: BigNumberish;
    creditAsset!: AddressLike;
    creditCurrency!: Currency;
    creditStartAmount!: BigNumberish;
    creditEndAmount!: BigNumberish;
    highestBidder!: AddressLike;
    highestBid!: BigNumberish;
    bidIncrement!: BigNumberish;
    startTime!: BigNumberish;
    closeTime!: BigNumberish;
    claimDelay!: BigNumberish;
    claimed!: boolean;
}
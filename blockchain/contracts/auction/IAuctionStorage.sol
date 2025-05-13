// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IAuctionStorage {
    struct Bid {
        address bidder;
        uint256 amount;
        uint48 timestamp;
    }

    struct AuctionPoolData {
        uint256 auctionId;
        address seller;

        address debitAsset; // Address of the token being sold (debit side)
        uint256 debitAssetId; // NFT id being sold
        uint256 debitAmount;

        address creditAsset; // Address of the token being received (credit side)
        uint256 creditStartAmount; // Auction start price
        uint256 creditEndAmount;

        address highestBidder; // Address of the highest bidder
        uint256 highestBid;    // Highest bid value

        uint256 bidIncrement;  // Minimum bid increment
        uint48 startTime; // Start time of the auction
        uint48 closeTime; // Close time of the auction

        uint32 claimDelay; // the delay timestamp in seconds when buyers can claim after close

        bool claimed; // Whether the seller has claimed the proceeds
    }

    struct CreateAuctionRequest {
        address creditAsset;
        uint256 creditStartAmount;
        uint256 creditEndAmount;
        uint256 bidIncrement;
        uint48 startTime;
        uint32 duration;
        uint32 claimDelay;
    }
}

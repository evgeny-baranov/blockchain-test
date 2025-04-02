// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IAuctionV1 {

    struct AuctionPoolData {
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


    struct Bid {
        address bidder;
        uint256 amount;
        uint48 timestamp;
    }

    event AuctionClaimed(uint256 indexed auctionId, address indexed seller, uint256 amount, uint256 commission);
    event AuctionCancelled(uint256 indexed auctionId, address indexed seller);
    event AuctionLotReceived(address operator, address from, uint256 tokenId, bytes data);
    event AuctionCreated(uint256 auctionId, address seller);
    event AuctionBid(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionClose(uint256 indexed auctionId, address indexed bidder, uint256 amount);

    error AuctionAlreadyClaimed(uint256 auctionId);
    error AuctionClosed(uint256 auctionId, uint48 closeTime, uint48 currentTime);
    error AuctionDoesNotExist(uint256 auctionId);
    error AuctionNotClosed(uint256 auctionId, uint48 closeTime, uint48 currentTime);
    error BidTooLow(uint256 auctionId, uint256 bidAmount, uint256 minimumBid);
    error BidTransferFailed(address sender, address contractAddress, uint256 amount);
    error ClaimNotReady(uint256 auctionId, uint48 claimReadyTime, uint48 currentTime);
    error FeeTransferFailed(address seller, uint256 amount);
    error InvalidSender(address sender, address expected);
    error NoBidsPlaced(uint256 auctionId);
    error NotOwnerOfLot(address caller, address expectedOwner, uint256 lotId);
    error RefundTransferFailed(address bidder, uint256 amount);

    function createAuctionLot(string memory uri) external returns (uint256);

    function getAuctionId(address debitAssetAddress, uint256 tokenId) external pure returns (uint256);

    function getAuctionsBySeller(address seller) external view returns (AuctionPoolData[] memory);

    function startAuction(
        uint256 auctionLotId,
        address creditAsset,
        uint256 creditStartAmount,
        uint256 creditEndAmount,
        uint256 bidIncrement,
        uint48 startTime,
        uint32 duration,
        uint32 claimDelay
    ) external payable;

    function placeBid(address debitAssetAddress, uint256 tokenId, uint256 bidAmount) external;

    function placeBid(uint256 auctionId, uint256 bidAmount) external;

    function finaliseAuction(uint256 auctionId) external;

    function cancelAuction(uint256 auctionId) external;

    function withdraw() external;
}

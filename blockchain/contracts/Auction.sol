// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IVersion} from "./utils/version/IVersion.sol";
import {ICommissionContainer} from "./utils/commission-container/ICommissionContainer.sol";
import {IAuctionStorage} from "./auction/IAuctionStorage.sol";


interface Auction is IVersion, ICommissionContainer, IAuctionStorage, IERC721Receiver {
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

    function getAuctionsBySeller(address seller) external view returns (AuctionPoolData[] memory);

    function getAuction(uint256 auctionId) external view returns (AuctionPoolData memory);

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

    function placeBid(uint256 auctionId, uint256 bidAmount) external;

    function finaliseAuction(uint256 auctionId) external;

    function cancelAuction(uint256 auctionId) external;

    function getWinningBid(uint256 auctionId) external view returns (Bid memory winnerBid);

    function withdraw() external;
}

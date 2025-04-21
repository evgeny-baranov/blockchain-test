// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/types/Time.sol";
import {AccessManager} from "../AccessManager.sol";
import {AuctionLot} from "../AuctionLot.sol";
import {CommissionContainer} from "../utils/commission-container/CommissionContainer.sol";
import {ICommissionContainer} from "../utils/commission-container/ICommissionContainer.sol";
import {IRegistry} from "../utils/access-manager/IRegistry.sol";
import {Version} from "../utils/version/Version.sol";
import {Auction} from "../Auction.sol";
import {AuctionStorage} from "./AuctionStorage.sol";
import {ViewAccessManagedUpgradeable} from "../utils/ViewAccessManagedUpgradeable.sol";

contract AuctionV1 is
Auction,
UUPSUpgradeable,
ViewAccessManagedUpgradeable,
CommissionContainer,
Version,
ERC721Holder,
ReentrancyGuardUpgradeable
{
    using Time for *;
    using AuctionStorage for AuctionStorage.Layout;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialAuthority) initializer public {
        __UUPSUpgradeable_init();
        __AccessManaged_init(initialAuthority);
        __CommissionContainer_init(10);
        __ReentrancyGuard_init();
    }

    function _authorizeUpgrade(address newImplementation) internal restricted override {
    }

    function _getAuctionLotAddress() internal view returns (address) {
        return IRegistry(
            authority()
        ).getContract(
            "AuctionLot"
        );
    }

    function createAuctionLot(string memory uri) external nonReentrant returns (uint256) {
        AuctionLot lotContract = AuctionLot(_getAuctionLotAddress());

        uint256 id = lotContract.mint(_msgSender(), uri);

        return id;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public virtual override(ERC721Holder, IERC721Receiver) returns (bytes4) {
        if (msg.sender != _getAuctionLotAddress()) {
            revert InvalidSender(msg.sender, _getAuctionLotAddress());
        }

        // Decode AuctionData from the data parameter
        CreateAuctionRequest memory auctionData = abi.decode(data, (CreateAuctionRequest));

        emit AuctionLotReceived(operator, from, tokenId, data);

        _handleAuctionLotToken(from, tokenId, auctionData);

        return this.onERC721Received.selector;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function _handleAuctionLotToken(
        address from,
        uint256 tokenId,
        CreateAuctionRequest memory auctionData
    ) internal {
        address debitAssetAddress = _getAuctionLotAddress();
        uint48 startTime = auctionData.startTime > 0 ? auctionData.startTime : Time.timestamp();

        AuctionPoolData memory poolData = AuctionPoolData(
            from,
            debitAssetAddress,
            tokenId,
            1,
            auctionData.creditAsset,
            auctionData.creditStartAmount,
            auctionData.creditEndAmount,
            address(0),
            0,
            auctionData.bidIncrement,
            startTime,
            startTime + auctionData.duration,
            auctionData.claimDelay,
            false
        );

        uint256 auctionId = getAuctionId(debitAssetAddress, tokenId);

        AuctionStorage.Layout storage $ = AuctionStorage.layout();

        $.auctions[auctionId] = poolData;
        $.sellerAuctions[from].push(auctionId);

        emit AuctionCreated(auctionId, from);
    }

    function withdraw() external restricted nonReentrant {
        payable(authority()).transfer(address(this).balance);
    }

    receive() external payable {

    }

    function getAuctionId(address debitAssetAddress, uint256 tokenId) public pure returns (uint256) {
        return uint256(
            keccak256(abi.encodePacked(debitAssetAddress, tokenId))
        );
    }

    function _getAuction(uint256 auctionId)
    internal isAuctionExist(auctionId)
    returns (AuctionPoolData storage)
    {
        AuctionStorage.Layout storage $ = AuctionStorage.layout();
        return $.auctions[auctionId];
    }

    function getAuctionsBySeller(address seller) external view returns (AuctionPoolData[] memory) {
        AuctionStorage.Layout storage $ = AuctionStorage.layout();
        uint256[] memory auctionIds = $.sellerAuctions[seller];
        uint256 count = auctionIds.length;

        AuctionPoolData[] memory result = new AuctionPoolData[](count);

        for (uint256 i = 0; i < count; i++) {
            result[i] = $.auctions[auctionIds[i]];
        }

        return result;
    }

    function startAuction(
        uint256 auctionLotId,
        address creditAsset,
        uint256 creditStartAmount,
        uint256 creditEndAmount,
        uint256 bidIncrement,
        uint48 startTime,
        uint32 duration,
        uint32 claimDelay
    ) external payable nonReentrant {
        address lotAddress = _getAuctionLotAddress();

        address lotOwner = IERC721(lotAddress).ownerOf(auctionLotId);

        if (lotOwner != _msgSender()) {
            revert NotOwnerOfLot(_msgSender(), lotOwner, auctionLotId);
        }

        CreateAuctionRequest memory data = CreateAuctionRequest(
            creditAsset,
            creditStartAmount,
            creditEndAmount,
            bidIncrement,
            startTime,
            duration,
            claimDelay
        );

        IERC721(lotAddress).safeTransferFrom(
            _msgSender(),
            address(this),
            auctionLotId,
            abi.encode(data)
        );
    }

    mapping(uint256 => Bid[]) public auctionBids;

    function _placeBid(uint256 auctionId, uint256 bidAmount) isAuctionNotClosed(auctionId) internal {
        AuctionPoolData storage auction = _getAuction(auctionId);

        // Check if the bid amount meets the minimum requirement
        uint256 minimumBid = auction.highestBid + auction.bidIncrement;
        if (bidAmount < minimumBid) {
            revert BidTooLow(auctionId, bidAmount, minimumBid);
        }

        // Check if the transfer of tokens succeeds
        IERC20 creditToken = IERC20(auction.creditAsset);

        if (!creditToken.transferFrom(_msgSender(), address(this), bidAmount)) {
            revert BidTransferFailed(_msgSender(), address(this), bidAmount);
        }

        if (auction.highestBidder != address(0)) {
            if (!creditToken.transfer(auction.highestBidder, auction.highestBid)) {
                revert RefundTransferFailed(auction.highestBidder, auction.highestBid);
            }
        }

        auction.highestBid = bidAmount;
        auction.highestBidder = _msgSender();

        emit AuctionBid(auctionId, _msgSender(), bidAmount);

        if (auction.creditEndAmount > 0 && bidAmount >= auction.creditEndAmount) {
            auction.closeTime = Time.timestamp();
            emit AuctionClose(auctionId, _msgSender(), bidAmount);
        }
    }

    function placeBid(uint256 auctionId, uint256 bidAmount) external nonReentrant {
        _placeBid(auctionId, bidAmount);
    }

    function finaliseAuction(uint256 auctionId) external restricted
    isAuctionClaimReady(auctionId)
    isAuctionNotClaimed(auctionId)
    {
        AuctionPoolData storage auction = _getAuction(auctionId);

        // Mark as claimed
        auction.claimed = true;

        // Transfer the funds to the seller
        IERC20 creditToken = IERC20(auction.creditAsset);

        uint256 commission = (auction.highestBid * _commissionPercent()) / 100;
        uint256 amount = auction.highestBid - commission;

        _collectCommission(
            auction.creditAsset,
            commission
        );

        if (!creditToken.transfer(auction.seller, amount)) {
            revert FeeTransferFailed(auction.seller, amount);
        }

        // Transfer asset back to the highest bidder
        IERC721 auctionLot = IERC721(auction.debitAsset);
        auctionLot.safeTransferFrom(address(this), auction.highestBidder, auction.debitAssetId);

        emit AuctionClaimed(auctionId, auction.seller, amount, commission);
    }

    function cancelAuction(uint256 auctionId) external restricted
    isAuctionNotClaimed(auctionId)
    {
        AuctionPoolData storage auction = _getAuction(auctionId);

        // Refund the highest bidder if a bid exists
        if (auction.highestBid > 0) {
            IERC20 creditToken = IERC20(auction.creditAsset);

            if (!creditToken.transfer(auction.highestBidder, auction.highestBid)) {
                revert RefundTransferFailed(auction.highestBidder, auction.highestBid);
            }
        }

        // Return the auctioned item to the seller
        IERC721 auctionLot = IERC721(auction.debitAsset);
        auctionLot.safeTransferFrom(address(this), auction.seller, auction.debitAssetId);

        // Mark the auction as claimed (to prevent further interaction)
        auction.claimed = true;

        emit AuctionCancelled(auctionId, auction.seller);
    }

    modifier isAuctionExist(uint256 auctionId) {
        AuctionStorage.Layout storage $ = AuctionStorage.layout();

        if ($.auctions[auctionId].seller == address(0)) {
            revert AuctionDoesNotExist(auctionId);
        }

        _;
    }

    modifier isAuctionNotClosed(uint256 auctionId) {
        AuctionStorage.Layout storage $ = AuctionStorage.layout();
        AuctionPoolData storage auction = $.auctions[auctionId];

        if (auction.closeTime <= Time.timestamp()) {
            revert AuctionClosed(auctionId, auction.closeTime, Time.timestamp());
        }

        _;
    }

    modifier isAuctionNotClaimed(uint256 auctionId) {
        AuctionStorage.Layout storage $ = AuctionStorage.layout();

        if ($.auctions[auctionId].claimed) {
            revert AuctionAlreadyClaimed(auctionId);
        }
        _;
    }

    modifier isAuctionClaimReady(uint256 auctionId) {
        AuctionStorage.Layout storage $ = AuctionStorage.layout();
        AuctionPoolData storage auction = $.auctions[auctionId];

        if (auction.closeTime > Time.timestamp()) {
            revert AuctionNotClosed(auctionId, auction.closeTime, Time.timestamp());
        }

        if (auction.highestBid == 0) {
            revert NoBidsPlaced(auctionId);
        }

        uint48 claimReadyTime = auction.closeTime + auction.claimDelay;
        if (claimReadyTime > Time.timestamp()) {
            revert ClaimNotReady(auctionId, claimReadyTime, Time.timestamp());
        }

        _;
    }

    function withdrawCommission(address creditAsset, address to) external
    restricted
    {
        _withdrawCommission(creditAsset, to);
    }

    function addAllowedToken(address creditAsset) external
    restricted
    onlyNotAllowedToken(creditAsset)
    {
        _addAllowedToken(creditAsset);
    }

    function removeAllowedToken(address creditAsset) external
    restricted
    onlyAllowedToken(creditAsset)
    {
        _removeAllowedToken(creditAsset);
    }

    function commissionAmount(address creditAsset) external view
    restrictedView
    returns (uint256) {
        return _commissionAmount(creditAsset);
    }

    function commissionPercent() external view
    restrictedView
    returns (uint256) {
        return _commissionPercent();
    }

    function updateCommissionPercent(uint256 commissionPercent) external
    restricted
    {
        _updateCommissionPercent(commissionPercent);
    }
}

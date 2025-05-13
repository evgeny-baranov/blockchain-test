// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Auction} from "../Auction.sol";
import {IAuctionStorage} from "./IAuctionStorage.sol";

library AuctionStorage {
    struct Layout {
        mapping(uint256 => IAuctionStorage.AuctionPoolData) auctions;
        mapping(address => uint256[]) sellerAuctions;
        mapping(uint256 => mapping(address => IAuctionStorage.Bid)) bidsByAuction;
        mapping(uint256 => address[]) biddersList;
        uint256 auctionCount;
    }

    // keccak256("auction.storage.AuctionStorage") & ~bytes32(uint256(0xff))
    bytes32 internal constant STORAGE_SLOT = 0x86d155588caea19175d74c440e0df742f04dadd27cc4fc2d55f208deade96600;

    function layout() internal pure returns (Layout storage s) {
        assembly {
            s.slot := STORAGE_SLOT
        }
    }
}

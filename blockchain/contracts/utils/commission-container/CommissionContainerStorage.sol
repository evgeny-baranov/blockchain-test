// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library CommissionContainerStorage {
    // keccak256("auction.storage.CommissionContainerStorage") & ~bytes32(uint256(0xff))
    bytes32 private constant STORAGE_SLOT = 0xe870275d48b5605f2e0102dd8da75e6759b81ef4852994221ca95c2d8a7e1700;

    struct Layout {
        uint256 contractCommissionPercent;
        address[] tokenList;
        mapping(address => uint256) accumulatedCommissions;
        mapping(address => bool) allowedTokens;
    }

    function layout() internal pure returns (Layout storage $) {
        assembly {
            $.slot := STORAGE_SLOT
        }
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library RegistryStorage {
    // keccak256("auction.storage.Registry") & ~bytes32(uint256(0xff))
    bytes32 private constant STORAGE_SLOT = 0xd1f5c27eb353d72a8e7dee790b4c19e096ded9e291c6f45ab638d9033273c900;

    struct Layout {
        bytes32[] keys;
        mapping(bytes32 => address) contracts;
        mapping(address => uint64[]) rolesByUser;
    }

    function layout() internal pure returns (Layout storage $) {
        assembly {
            $.slot := STORAGE_SLOT
        }
    }
}

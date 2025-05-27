// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IAuctionLot {
    function mint(address to, string memory uri) external returns (uint256);

    function burn(uint256 tokenId) external;

    function getTokensOfOwner(address owner) external view returns (uint256[] memory);

    function setBaseURI(string memory newBaseUri) external;

    function pause() external;

    function unpause() external;
}
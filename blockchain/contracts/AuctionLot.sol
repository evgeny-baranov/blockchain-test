// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/IAccessManaged.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IAuctionLotV1} from "./tokens/auction-lot/IAuctionLotV1.sol";

interface AuctionLot is IAuctionLotV1, IERC721Enumerable, IERC721Metadata {
    function mint(address to, string memory uri) external returns (uint256);

    function burn(uint256 tokenId) external;

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) external;

    function getTokensOfOwner(address owner) external view returns (uint256[] memory);
}
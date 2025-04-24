// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/IAccessManaged.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IVersion} from "./utils/version/IVersion.sol";
import {IAuctionLot} from "./tokens/auction-lot/IAuctionLot.sol";

interface AuctionLot is IAuctionLot, IERC721Enumerable, IERC721Metadata, IVersion, IAccessManaged {

}
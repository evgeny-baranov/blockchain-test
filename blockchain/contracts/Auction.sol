// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IAuctionV1} from "./auction/IAuctionV1.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IVersion} from "./utils/version/IVersion.sol";
import {ICommissionContainer} from "./utils/commission-container/ICommissionContainer.sol";


interface Auction is IAuctionV1, IVersion, ICommissionContainer, IERC721Receiver {

}

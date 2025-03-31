// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/IAccessManaged.sol";
import {IVersion} from "../../utils/version/IVersion.sol";

interface IAuctionLotV1 is IVersion, IAccessManaged {
    function mint(address to, string memory uri) external returns (uint256);

    function burn(uint256 tokenId) external;

    function getTokensOfOwner(address owner) external view returns (uint256[] memory);
}
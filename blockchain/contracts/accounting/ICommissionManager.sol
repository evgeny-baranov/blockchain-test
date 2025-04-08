// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../utils/commission-container/ICommissionContainer.sol";
import "@openzeppelin/contracts/access/manager/IAccessManaged.sol";

interface ICommissionManager {
    function withdrawContainerCommission(address container, address creditAsset, address to) external;

    function updateContainerCommissionPercent(address container, uint256 commissionPercent) external;

    function addContainerAllowedToken(address container, address creditAsset) external;

    function removeContainerAllowedToken(address container, address creditAsset) external;

    function containerAllowedTokens(address container) external view returns (ICommissionContainer.TokenData[] memory);

    function containerCommissionAmount(address container, address creditAsset) external view returns (uint256);
}
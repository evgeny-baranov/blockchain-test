// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface ICommissionContainer {
    function withdrawCommission(address creditAsset, address to) external;

    function updateCommissionPercent(uint256 commissionPercent) external;

    function addAllowedToken(address creditAsset) external;

    function commissionAmount(address creditAsset) external view returns (uint256);
}
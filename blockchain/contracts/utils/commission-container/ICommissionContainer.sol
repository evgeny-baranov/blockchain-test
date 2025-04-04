// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface ICommissionContainer {
    error NoCommissionToDebit(address creditAsset);
    error InvalidCreditAsset(address creditAsset);
    error TokenAlreadyAllowed(address creditAsset);
    error CreditAssetNotAllowed(address creditAsset);
    error CommissionDebitFailed(address creditAsset, address to, uint256 amount);

    event CommissionDebited(address indexed creditAsset, address indexed to, uint256 amount);
    event CommissionCredited(address indexed creditAsset, uint256 amount);
    event CommissionTokenAdded(address indexed token);
    event CommissionTokenRemoved(address indexed token);

    function withdrawCommission(address creditAsset, address to) external;

    function updateCommissionPercent(uint256 commissionPercent) external;

    function addAllowedToken(address creditAsset) external;

    function removeAllowedToken(address creditAsset) external;

    function commissionAmount(address creditAsset) external view returns (uint256);
}
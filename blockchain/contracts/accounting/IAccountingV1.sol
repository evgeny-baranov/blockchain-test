// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/IAccessManaged.sol";

interface IAccountingV1 {
    function withdrawContainerCommission(address payable container, address creditAsset, address to) external;

    function updateContainerCommissionPercent(address payable container, uint256 commissionPercent) external;

    function addContainerAllowedToken(address payable container, address creditAsset) external;

    function containerCommissionAmount(address payable container, address creditAsset) external view returns (uint256);

}
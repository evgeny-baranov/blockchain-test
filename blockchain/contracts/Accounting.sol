// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IAccountingV1} from "./accounting/IAccountingV1.sol";
import "@openzeppelin/contracts/access/manager/IAccessManaged.sol";
import {IVersion} from "./utils/version/IVersion.sol";

interface Accounting is IAccountingV1, IAccessManaged {
    function withdrawContainerCommission(address payable container, address creditAsset, address to) external;

    function updateContainerCommissionPercent(address payable container, uint256 commissionPercent) external;

    function addContainerAllowedToken(address payable container, address creditAsset) external;

    function containerCommissionAmount(address payable container, address creditAsset) external view returns (uint256);
}
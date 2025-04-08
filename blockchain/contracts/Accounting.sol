// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ICommissionManager} from "./accounting/ICommissionManager.sol";
import {IAccessManaged} from "@openzeppelin/contracts/access/manager/IAccessManaged.sol";
import {IVersion} from "./utils/version/IVersion.sol";
import {ICommissionContainer} from "./utils/commission-container/ICommissionContainer.sol";

interface Accounting is ICommissionManager, ICommissionContainer, IAccessManaged, IVersion {

}
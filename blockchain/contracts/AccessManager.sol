// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/IAccessManager.sol";
import {IRegistry} from "./utils/access-manager/IRegistry.sol";
import {IVersion} from "./utils/version/IVersion.sol";
import {Roles} from "./utils/Roles.sol";

interface AccessManager is IVersion, IAccessManager, IRegistry {
    function getRoles() external pure returns (Roles.RoleSelectors[] memory);

    function initRoleSelectors(address resource) external returns (Roles.RoleSelectors[] memory);
}
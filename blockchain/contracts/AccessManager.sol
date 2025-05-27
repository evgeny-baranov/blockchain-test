// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Roles} from "./utils/Roles.sol";
import {IAccessManagerV1} from "./utils/access-manager/IAccessManagerV1.sol";
import {IRegistry} from "./utils/access-manager/IRegistry.sol";
import {IVersion} from "./utils/version/IVersion.sol";

interface AccessManager is IVersion, IAccessManager, IRegistry, IAccessManagerV1 {
    function getRoles() external pure returns (Roles.RoleSelectors[] memory);

    function initRoleSelectors(address resource) external;
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagerUpgradeable.sol";
import "@openzeppelin/contracts/access/manager/IAccessManager.sol";
import {IRegistry} from "./IRegistry.sol";
import {IVersion} from "../version/IVersion.sol";
import {Roles} from "../Roles.sol";

interface IAccessManagerV1 is IVersion, IRegistry, IAccessManager {
    function getRoles() external pure returns (Roles.RoleSelectors[] memory);

    function initRoleSelectors(address resource) external;
}
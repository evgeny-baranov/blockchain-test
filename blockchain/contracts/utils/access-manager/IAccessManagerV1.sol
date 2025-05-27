// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Roles} from "../Roles.sol";

interface IAccessManagerV1  {
    function getRoles() external pure returns (Roles.RoleSelectors[] memory);

    function initRoleSelectors(address resource) external;
}
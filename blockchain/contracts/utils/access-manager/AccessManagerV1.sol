// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagerUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Registry} from "./Registry.sol";
import {Roles} from "../Roles.sol";
import {Version} from "../version/Version.sol";
import "hardhat/console.sol";

/// @custom:security-contact info@baranov.eu
contract AccessManagerV1 is
Version,
Registry,
AccessManagerUpgradeable,
UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialAdmin) public virtual override initializer {
        __UUPSUpgradeable_init();
        __AccessManager_init(initialAdmin);

        _registerContract(
        keccak256(abi.encodePacked("AccessManager")),
            address(this)
        );
    }

    function getRoles() external pure returns (Roles.RoleSelectors[] memory) {
        return Roles.getRolesWithSelectors();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAuthorized {

    }

    function _initRoleSelectors(address resource) internal returns (Roles.RoleSelectors[] memory) {
        Roles.RoleSelectors[] memory roles = this.getRoles();

        for (uint256 i = 0; i < roles.length; i++) {
            bytes4[] memory selectors = roles[i].selectors;
            uint64 roleId = roles[i].role;

            for (uint256 s = 0; s < selectors.length; ++s) {
                _setTargetFunctionRole(resource, selectors[s], roleId);
            }
        }

        return roles;
    }

    function initRoleSelectors(address resource) external onlyAuthorized returns (Roles.RoleSelectors[] memory) {
        return _initRoleSelectors(resource);
    }

    function registerContract(string memory name, address contractAddress) public onlyAuthorized {
        _registerContract(keccak256(abi.encodePacked(name)), contractAddress);
    }

    function getRegisteredContracts() public view returns (bytes32[] memory, address[] memory) {
        return _getRegisteredContracts();
    }
}
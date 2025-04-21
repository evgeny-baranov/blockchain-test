// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IRegistry} from "./IRegistry.sol";
import {RegistryStorage} from "./RegistryStorage.sol";

abstract contract Registry is IRegistry, Initializable {

    using RegistryStorage for RegistryStorage.Layout;

    function _registerContract(bytes32 contractId, address contractAddress) internal {
        RegistryStorage.Layout storage $ = RegistryStorage.layout();

        if ($.contracts[contractId] != address(0) && $.contracts[contractId] != contractAddress) {
            revert AlreadyRegisteredContract(contractId);
        }

        $.contracts[contractId] = contractAddress;
        $.keys.push(contractId);

        emit ContractRegistered(contractId, contractAddress);
    }

    function _getRegisteredContract(bytes32 contractId) internal view returns (address) {
        RegistryStorage.Layout storage $ = RegistryStorage.layout();

        return $.contracts[contractId];
    }

    function _getRegisteredContracts() internal view returns (bytes32[] memory, address[] memory) {
        RegistryStorage.Layout storage $ = RegistryStorage.layout();
        address[] memory values = new address[]($.keys.length);

        for (uint256 i = 0; i < $.keys.length; i++) {
            values[i] = $.contracts[$.keys[i]];
        }

        return ($.keys, values);
    }

    function _getRolesOf(address user) internal view returns (uint64[] memory) {
        return RegistryStorage.layout().rolesByUser[user];
    }


    function getContract(string memory name) public view returns (address) {
        return _getRegisteredContract(
            keccak256(abi.encodePacked(name))
        );
    }

    function isRegistered(address container) public view returns (bool) {
        RegistryStorage.Layout storage $ = RegistryStorage.layout();

        bool flag = false;

        for (uint256 i = 0; i < $.keys.length; i++) {
            if ($.contracts[$.keys[i]] == container) {
                flag = true;
                break;
            }
        }

        return flag;
    }

    modifier onlyRegistered(bytes32 name) {
        RegistryStorage.Layout storage $ = RegistryStorage.layout();
        if ($.contracts[name] == address(0)) {
            revert UnregisteredContract(name);
        }

        _;
    }

    modifier onlyRegisteredAddress(address container) {
        if (!isRegistered(container)) {
            revert UnregisteredContractAddress(container);
        }

        _;
    }

    function _registerUserRole(address account, uint64 roleId) internal {
        RegistryStorage.Layout storage $ = RegistryStorage.layout();
        uint64[] storage roles = $.rolesByUser[account];

        for (uint256 i = 0; i < roles.length; i++) {
            if (roles[i] == roleId) {
                return;
            }
        }

        roles.push(roleId);
    }

    function _unregisterUserRole(address account, uint64 roleId) internal {
        RegistryStorage.Layout storage $ = RegistryStorage.layout();

        uint64[] storage roles = $.rolesByUser[account];

        for (uint256 i = 0; i < roles.length; i++) {
            if (roles[i] == roleId) {
                roles[i] = roles[roles.length - 1];
                roles.pop();
                break;
            }
        }
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IRegistry} from "./IRegistry.sol";

abstract contract Registry is IRegistry, Initializable {

    // keccak256("auction.storage.Registry") & ~bytes32(uint256(0xff))
    bytes32 private constant RegistryStorageLocation = 0xd1f5c27eb353d72a8e7dee790b4c19e096ded9e291c6f45ab638d9033273c900;

    struct RegistryStorage {
        bytes32[] keys;
        mapping(bytes32 => address) contracts;
    }

    function _getRegistryStorage() private pure returns (RegistryStorage storage $) {
        assembly {
            $.slot := RegistryStorageLocation
        }
    }

    function _registerContract(bytes32 contractId, address contractAddress) internal {
        RegistryStorage storage $ = _getRegistryStorage();

        if ($.contracts[contractId] != address(0) && $.contracts[contractId] != contractAddress) {
            revert AlreadyRegisteredContract(contractId);
        }

        $.contracts[contractId] = contractAddress;
        $.keys.push(contractId);

        emit ContractRegistered(contractId, contractAddress);
    }

    function _getRegisteredContract(bytes32 contractId) internal view returns (address) {
        RegistryStorage storage $ = _getRegistryStorage();

        return $.contracts[contractId];
    }

    function _getRegisteredContracts() internal view returns (bytes32[] memory, address[] memory) {
        RegistryStorage storage $ = _getRegistryStorage();
        address[] memory values = new address[]($.keys.length);

        for (uint256 i = 0; i < $.keys.length; i++) {
            values[i] = $.contracts[$.keys[i]];
        }

        return ($.keys, values);
    }

    function getContract(string memory name) public view returns (address) {
        return _getRegisteredContract(
            keccak256(abi.encodePacked(name))
        );
    }

    function isRegistered(address container) public view returns (bool) {
        RegistryStorage storage $ = _getRegistryStorage();

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
        RegistryStorage storage $ = _getRegistryStorage();
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
}

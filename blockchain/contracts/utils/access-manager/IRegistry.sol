// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IRegistry {
    event ContractRegistered(bytes32 indexed name, address indexed contractAddress);

    error UnregisteredContract(bytes32 name);
    error UnregisteredContractAddress(address container);
    error AlreadyRegisteredContract(bytes32 name);

    function getContract(string memory name) external view returns (address);

    function getRegisteredContracts() external view returns (bytes32[] memory, address[] memory);

    function getRolesOf(address user) external view returns (uint64[] memory);

    function registerContract(string memory name, address contractAddress) external;

    function isRegistered(address container) external returns (bool);
}

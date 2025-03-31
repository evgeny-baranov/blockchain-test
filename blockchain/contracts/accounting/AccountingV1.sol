// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IAccountingV1} from "./IAccountingV1.sol";
import {ICommissionContainer} from "../utils/commission-container/ICommissionContainer.sol";
import {Registry} from "../utils/access-manager/Registry.sol";
import {Version} from "../utils/version/Version.sol";
import {AuctionV1} from "../auction/AuctionV1.sol";

contract AccountingV1 is
IAccountingV1,
UUPSUpgradeable,
AccessManagedUpgradeable,
Version
{
    error UnregisteredContractAddress(address container);

    function initialize(address initialAuthority) initializer public {
        __UUPSUpgradeable_init();
        __AccessManaged_init(initialAuthority);
    }

    function _authorizeUpgrade(address newImplementation) internal restricted override {

    }

    function addContainerAllowedToken(address payable container, address creditAsset) external restricted {
        ICommissionContainer(container).addAllowedToken(creditAsset);
    }

    function containerCommissionAmount(address payable container, address creditAsset) external view
    returns (uint256) {
        return ICommissionContainer(container).commissionAmount(creditAsset);
    }

    function updateContainerCommissionPercent(address payable container, uint256 commissionPercent) external
    restricted
    {
        ICommissionContainer(container).updateCommissionPercent(commissionPercent);
    }

    function withdrawContainerCommission(address payable container, address creditAsset, address to) external
    restricted
    {
        ICommissionContainer(container).withdrawCommission(creditAsset, to);
    }
}
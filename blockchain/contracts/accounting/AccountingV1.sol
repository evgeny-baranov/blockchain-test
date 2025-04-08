// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ICommissionManager} from "./ICommissionManager.sol";
import {ICommissionContainer} from "../utils/commission-container/ICommissionContainer.sol";
import {CommissionContainer} from "../utils/commission-container/CommissionContainer.sol";
import {Registry} from "../utils/access-manager/Registry.sol";
import {Version} from "../utils/version/Version.sol";
import {AuctionV1} from "../auction/AuctionV1.sol";
import {Accounting} from "../Accounting.sol";

contract AccountingV1 is
Initializable,
UUPSUpgradeable,
AccessManagedUpgradeable,
Version,
CommissionContainer,
ICommissionManager
{
    error UnregisteredContractAddress(address container);

    function initialize(address initialAuthority) initializer public {
        __UUPSUpgradeable_init();
        __AccessManaged_init(initialAuthority);
        __CommissionContainer_init(0);
    }

    function _authorizeUpgrade(address newImplementation) internal restricted override {

    }

    function addContainerAllowedToken(address container, address creditAsset) external restricted {
        ICommissionContainer(container).addAllowedToken(creditAsset);
    }

    function removeContainerAllowedToken(address container, address creditAsset) external restricted {
        ICommissionContainer(container).removeAllowedToken(creditAsset);
    }

    function containerAllowedTokens(address container) external view returns (TokenData[] memory) {
        return ICommissionContainer(container).getAllowedTokens();
    }

    function containerCommissionAmount(address container, address creditAsset) external view
    returns (uint256) {
        return ICommissionContainer(container).commissionAmount(creditAsset);
    }

    function updateContainerCommissionPercent(address container, uint256 commissionPercent) external
    restricted
    {
        ICommissionContainer(container).updateCommissionPercent(commissionPercent);
    }

    function withdrawContainerCommission(address container, address creditAsset, address to) external
    restricted
    {
        ICommissionContainer(container).withdrawCommission(creditAsset, to);
    }


    function withdrawCommission(address creditAsset, address to) external
    restricted
    {
        _withdrawCommission(creditAsset, to);
    }

    function addAllowedToken(address creditAsset) external
    restricted
    {
        _addAllowedToken(creditAsset);
    }

    function removeAllowedToken(address creditAsset) external
    restricted
    {
        _removeAllowedToken(creditAsset);
    }

    function commissionAmount(address creditAsset) external view
    returns (uint256) {
        uint256 amount = _commissionAmount(creditAsset);
        return amount;
    }

    function updateCommissionPercent(uint256 commissionPercent) external
    restricted
    {
        _updateCommissionPercent(commissionPercent);
    }
}
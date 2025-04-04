// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICommissionContainer} from "./ICommissionContainer.sol";
import {CommissionContainerStorage} from "./CommissionContainerStorage.sol";

abstract contract CommissionContainer is Initializable, ICommissionContainer {
    using CommissionContainerStorage for CommissionContainerStorage.Layout;

    function __CommissionContainer_init(uint256 _contractCommissionPercent, address[] memory allowedTokens) internal onlyInitializing {
        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();

        $.contractCommissionPercent = _contractCommissionPercent;

        for (uint256 i = 0; i < allowedTokens.length; i++) {
            $.allowedTokens[allowedTokens[i]] = true;
            $.tokenList.push(allowedTokens[i]);
        }
    }

    function _updateCommissionContainer(uint256 _contractCommissionPercent) internal {
        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();
        $.contractCommissionPercent = _contractCommissionPercent;
    }

    function _withdrawCommission(address creditAsset, address to) internal {
        uint256 amount = _commissionAmount(creditAsset);

        if (amount == 0) {
            revert NoCommissionToDebit(creditAsset);
        }

        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();

        IERC20 creditToken = IERC20(creditAsset);

        $.accumulatedCommissions[creditAsset] = 0;

        if (!creditToken.transfer(to, amount)) {
            revert CommissionDebitFailed(to, creditAsset, amount);
        }

        emit CommissionDebited(creditAsset, to, amount);
    }

    function _collectCommission(address creditAsset, uint256 amount) internal
    onlyAllowedToken(creditAsset)
    {
        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();

        $.accumulatedCommissions[creditAsset] += amount;

        emit CommissionCredited(creditAsset, amount);
    }

    function _updateCommissionPercent(uint256 _contractCommissionPercent) internal {
        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();

        $.contractCommissionPercent = _contractCommissionPercent;
    }

    function _commissionPercent() internal view returns (uint256) {
        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();

        return $.contractCommissionPercent;
    }

    function _commissionAmount(address creditAsset) internal view
    returns (uint256)
    {
        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();
        uint256 amount = $.accumulatedCommissions[creditAsset];
        return amount;
    }

    function _addAllowedToken(address creditAsset) internal {
        if (creditAsset == address(0)) {
            revert InvalidCreditAsset(creditAsset);
        }

        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();

        if ($.allowedTokens[creditAsset]) {
            revert TokenAlreadyAllowed(creditAsset);
        }

        $.allowedTokens[creditAsset] = true;
        $.tokenList.push(creditAsset);

        emit CommissionTokenAdded(creditAsset);
    }

    function _removeAllowedToken(address creditAsset) internal
    onlyAllowedToken(creditAsset)
    {
        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();

        $.allowedTokens[creditAsset] = false;

        // Remove token from the list
        for (uint256 i = 0; i < $.tokenList.length; i++) {
            if ($.tokenList[i] == creditAsset) {
                $.tokenList[i] = CommissionContainerStorage.layout().tokenList[$.tokenList.length - 1];
                $.tokenList.pop();
                break;
            }
        }

        emit CommissionTokenRemoved(creditAsset);
    }

    modifier onlyAllowedToken(address creditAsset) {
        CommissionContainerStorage.Layout storage $ = CommissionContainerStorage.layout();

        if (!$.allowedTokens[creditAsset]) {
            revert  CreditAssetNotAllowed(creditAsset);
        }

        _;
    }
}
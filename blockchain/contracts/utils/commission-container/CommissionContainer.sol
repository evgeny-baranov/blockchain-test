// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract CommissionContainer is Initializable {
    error NoCommissionToDebit(address creditAsset);
    error InvalidCreditAsset(address creditAsset);
    error TokenAlreadyAllowed(address creditAsset);
    error CreditAssetNotAllowed(address creditAsset);
    error CommissionDebitFailed(address creditAsset, address to, uint256 amount);

    event CommissionDebited(address indexed creditAsset, address indexed to, uint256 amount);
    event CommissionCredited(address indexed creditAsset, uint256 amount);
    event CommissionTokenAdded(address indexed token);
    event CommissionTokenRemoved(address indexed token);

    // keccak256("auction.storage.CommissionStorage") & ~bytes32(uint256(0xff))
    bytes32 private constant CommissionStorageLocation = 0xe870275d48b5605f2e0102dd8da75e6759b81ef4852994221ca95c2d8a7e1700;

    struct CommissionStorage {
        uint256 contractCommissionPercent;
        address[] tokenList;
        mapping(address => uint256) accumulatedCommissions;
        mapping(address => bool) allowedTokens;
    }

    function __CommissionContainer_init(uint256 _contractCommissionPercent, address[] memory allowedTokens) internal onlyInitializing {
        CommissionStorage storage $ = _getCommissionStorage();
        $.contractCommissionPercent = _contractCommissionPercent;

        for (uint256 i = 0; i < allowedTokens.length; i++) {
            $.allowedTokens[allowedTokens[i]] = true;
            $.tokenList.push(allowedTokens[i]);
        }
    }

    function _getCommissionStorage() private pure returns (CommissionStorage storage $) {
        assembly {
            $.slot := CommissionStorageLocation
        }
    }

    function _updateCommissionContainer(uint256 _contractCommissionPercent) internal {
        CommissionStorage storage $ = _getCommissionStorage();
        $.contractCommissionPercent = _contractCommissionPercent;
    }

    function _withdrawCommission(address creditAsset, address to) internal {
        uint256 amount = _commissionAmount(creditAsset);

        if (amount == 0) {
            revert NoCommissionToDebit(creditAsset);
        }

        CommissionStorage storage $ = _getCommissionStorage();

        IERC20 creditToken = IERC20(creditAsset);

        $.accumulatedCommissions[creditAsset] = 0;

        if (!creditToken.transfer( to, amount)) {
            revert CommissionDebitFailed(to, creditAsset, amount);
        }

        emit CommissionDebited(creditAsset, to, amount);
    }

    function _collectCommission(address creditAsset, uint256 amount) internal
    onlyAllowedToken(creditAsset)
    {
        CommissionStorage storage $ = _getCommissionStorage();

        $.accumulatedCommissions[creditAsset] += amount;

        emit CommissionCredited(creditAsset, amount);
    }

    function _updateCommissionPercent(uint256 _contractCommissionPercent) internal {
        CommissionStorage storage $ = _getCommissionStorage();

        $.contractCommissionPercent = _contractCommissionPercent;
    }

    function _commissionPercent() internal view returns (uint256) {
        CommissionStorage storage $ = _getCommissionStorage();

        return $.contractCommissionPercent;
    }

    function _commissionAmount(address creditAsset) internal view
    returns (uint256)
    {
        CommissionStorage storage $ = _getCommissionStorage();
        uint256 amount = $.accumulatedCommissions[creditAsset];
        return amount;
    }

    function _addAllowedToken(address creditAsset) internal {
        if (creditAsset == address(0)) {
            revert InvalidCreditAsset(creditAsset);
        }

        CommissionStorage storage $ = _getCommissionStorage();

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
        CommissionStorage storage $ = _getCommissionStorage();

        $.allowedTokens[creditAsset] = false;

        // Remove token from the list
        for (uint256 i = 0; i < $.tokenList.length; i++) {
            if ($.tokenList[i] == creditAsset) {
                $.tokenList[i] = _getCommissionStorage().tokenList[$.tokenList.length - 1];
                $.tokenList.pop();
                break;
            }
        }

        emit CommissionTokenRemoved(creditAsset);
    }

    modifier onlyAllowedToken(address creditAsset) {
        CommissionStorage storage $ = _getCommissionStorage();

        if (!$.allowedTokens[creditAsset]) {
            revert  CreditAssetNotAllowed(creditAsset);
        }

        _;
    }
}
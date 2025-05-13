// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import "@openzeppelin/contracts/access/manager/IAccessManaged.sol";

abstract contract ViewAccessManagedUpgradeable is AccessManagedUpgradeable {
    modifier restrictedView() {
        _checkCanCallView(_msgSender(), _msgData());
        _;
    }

    function _checkCanCallView(address caller, bytes calldata data) internal virtual view {
        (bool immediate, ) = AuthorityUtils.canCallWithDelay(
            authority(),
            caller,
            address(this),
            bytes4(data[0 : 4])
        );

        if (!immediate) {
            revert AccessManagedUnauthorized(caller);
        }
    }
}
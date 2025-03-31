// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IVersion} from "./IVersion.sol";

abstract contract Version is IVersion, Initializable {
    function version() external view returns (uint64) {
        return _getInitializedVersion();
    }
}
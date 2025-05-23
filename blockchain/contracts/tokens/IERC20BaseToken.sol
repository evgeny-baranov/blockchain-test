// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IAccessManaged} from "@openzeppelin/contracts/access/manager/IAccessManaged.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IVersion} from "../utils/version/IVersion.sol";

interface IERC20BaseToken is IVersion, IERC20Metadata, IERC20Errors, IAccessManaged {
    function mint(uint256 amount) external;

    function mintTo(address to, uint256 amount) external;

    function burn(uint256 value) external;

    function burnFrom(address account, uint256 value) external;
}

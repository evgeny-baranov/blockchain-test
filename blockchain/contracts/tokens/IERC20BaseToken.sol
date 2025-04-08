// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

interface IERC20BaseToken is IERC20Metadata, IERC20Errors {
    function mint(uint256 amount) external;

    function mintTo(address to, uint256 amount) external;

    function burn(uint256 value) external;

    function burnFrom(address account, uint256 value) external;

    function grantRole(address account, uint64 roleId) external;
}

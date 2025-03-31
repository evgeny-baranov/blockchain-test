// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/IAccessManaged.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC1822.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IVersion} from "../../utils/version/IVersion.sol";

interface IEuroTokenV1 is IVersion, IAccessManaged, IERC20, IERC20Metadata
{
    function mint(address to, uint256 amount) external;

    function burn(uint256 value) external;

    function burnFrom(address account, uint256 value) external;

    function grantRole(address account, uint64 roleId) external;
}
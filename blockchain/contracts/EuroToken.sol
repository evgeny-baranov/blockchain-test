// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEuroTokenV1} from "./tokens/euro-token/IEuroTokenV1.sol";


interface EuroToken is IEuroTokenV1 {
    function mint(address to, uint256 amount) external;

    function burn(uint256 value) external;

    function burnFrom(address account, uint256 value) external;
}
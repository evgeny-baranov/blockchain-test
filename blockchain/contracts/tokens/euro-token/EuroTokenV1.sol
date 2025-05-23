// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {AccessManager} from "../../AccessManager.sol";
import {ERC20BaseToken} from "../ERC20BaseToken.sol";
import {EuroToken} from "../../EuroToken.sol";
import {IERC20BaseToken} from "../IERC20BaseToken.sol";
import {Roles} from "../../utils/Roles.sol";
import {ViewAccessManagedUpgradeable} from "../../utils/ViewAccessManagedUpgradeable.sol";

/// @custom:security-contact info@baranov.eu
contract EuroTokenV1 is
ViewAccessManagedUpgradeable,
ERC20BaseToken,
UUPSUpgradeable,
EuroToken
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialAuthority) initializer public {
        __AccessManaged_init(initialAuthority);
        __ERC20BaseToken_init("EuroToken", "EUR");
        __UUPSUpgradeable_init();
    }

    function mint(uint256 amount) public restricted {
        _mint(_msgSender(), amount);
    }

    function mintTo(address to, uint256 amount) public restricted {
        _mint(to, amount);
    }

    function burn(uint256 value) public virtual override(ERC20BurnableUpgradeable, IERC20BaseToken) restricted {
        super.burn(value);
    }

    function burnFrom(address account, uint256 value) public virtual override(ERC20BurnableUpgradeable, IERC20BaseToken) restricted {
        super.burnFrom(account, value);
    }

    function _authorizeUpgrade(address newImplementation) internal override restricted {

    }
}
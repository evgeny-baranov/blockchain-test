// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {AccessManager} from "../../AccessManager.sol";
import {ERC20BaseToken} from "../../utils/ERC20BaseToken.sol";
import {IEuroTokenV1} from "./IEuroTokenV1.sol";
import {Roles} from "../../utils/Roles.sol";

/// @custom:security-contact info@baranov.eu
contract EuroTokenV1 is
IEuroTokenV1,
AccessManagedUpgradeable,
ERC20BaseToken,
UUPSUpgradeable
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

    function grantRole(address account, uint64 roleId) external restricted {
        AccessManager(authority()).grantRole(roleId, account, 0);
    }

    function mint(address to, uint256 amount) public restricted {
        _mint(to, amount);
    }

    function burn(uint256 value) public virtual override(ERC20BurnableUpgradeable, IEuroTokenV1) restricted {
        super.burn(value);
    }

    function burnFrom(address account, uint256 value) public virtual override(ERC20BurnableUpgradeable, IEuroTokenV1) restricted {
        super.burnFrom(account, value);
    }

    function _authorizeUpgrade(address newImplementation) internal override restricted {

    }
}
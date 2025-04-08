// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {AuctionLot} from "../AuctionLot.sol";
import {EuroToken} from "../EuroToken.sol";
import {IERC20BaseToken} from "../tokens/IERC20BaseToken.sol";
import {ICommissionContainer} from "../utils/commission-container/ICommissionContainer.sol";
import {IRegistry} from "./access-manager/IRegistry.sol";
import {Auction} from "../Auction.sol";
import {ICommissionManager} from "../accounting/ICommissionManager.sol";

library Roles {
    struct RoleSelectors {
        string label;
        uint64 role;
        bytes4[] selectors;
    }

    string public constant ADMIN_ROLE_LABEL = "ADMIN";
    string public constant UPGRADE_ROLE_LABEL = "UPGRADE";
    string public constant MINTER_ROLE_LABEL = "MINTER";
    string public constant BURNER_ROLE_LABEL = "BURNER";
    string public constant ACCOUNTANT_ROLE_LABEL = "ACCOUNTANT";

    uint64 public constant ADMIN_ROLE = 0;
    uint64 public constant UPGRADE_ROLE = 1;
    uint64 public constant MINTER_ROLE = 2;
    uint64 public constant BURNER_ROLE = 3;
    uint64 public constant ACCOUNTANT_ROLE = 4;

    function getRolesWithSelectors() internal pure returns (RoleSelectors[] memory) {
        RoleSelectors[] memory roleSelectors = new RoleSelectors[](5);

        roleSelectors[0] = RoleSelectors({
            label: BURNER_ROLE_LABEL,
            role: BURNER_ROLE,
            selectors: getBurnSelectors()
        });

        roleSelectors[1] = RoleSelectors({
            label: MINTER_ROLE_LABEL,
            role: MINTER_ROLE,
            selectors: getMintSelectors()
        });

        roleSelectors[2] = RoleSelectors({
            label: UPGRADE_ROLE_LABEL,
            role: UPGRADE_ROLE,
            selectors: getUpgradeSelectors()
        });

        roleSelectors[3] = RoleSelectors({
            label: ACCOUNTANT_ROLE_LABEL,
            role: ACCOUNTANT_ROLE,
            selectors: getAccountantSelectors()
        });

        roleSelectors[4] = RoleSelectors({
            label: ADMIN_ROLE_LABEL,
            role: ADMIN_ROLE,
            selectors: new bytes4[](0)
        });

        return roleSelectors;
    }

    function getBurnSelectors() internal pure returns (bytes4[] memory) {
        bytes4[3] memory temporary = [
                            ERC721BurnableUpgradeable.burn.selector,
                            ERC20BurnableUpgradeable.burn.selector,
                            ERC20BurnableUpgradeable.burnFrom.selector
            ];

        bytes4[] memory selectors = new bytes4[](temporary.length);
        for (uint i = 0; i < temporary.length; i++) {
            selectors[i] = temporary[i];
        }

        return selectors;
    }

    function getMintSelectors() internal pure returns (bytes4[] memory) {
        bytes4[2] memory temporary = [
                            IERC20BaseToken.mint.selector,
                            IERC20BaseToken.mintTo.selector
            ];

        bytes4[] memory selectors = new bytes4[](temporary.length);
        for (uint i = 0; i < temporary.length; i++) {
            selectors[i] = temporary[i];
        }

        return selectors;
    }

    function getUpgradeSelectors() internal pure returns (bytes4[] memory) {
        bytes4[2] memory temporary = [
                            UUPSUpgradeable.upgradeToAndCall.selector,
                            IRegistry.registerContract.selector
            ];

        bytes4[] memory selectors = new bytes4[](temporary.length);
        for (uint i = 0; i < temporary.length; i++) {
            selectors[i] = temporary[i];
        }

        return selectors;
    }

    function getAccountantSelectors() internal pure returns (bytes4[] memory) {
        bytes4[9] memory temporary = [
                            ICommissionManager.withdrawContainerCommission.selector,
                            ICommissionManager.updateContainerCommissionPercent.selector,
                            ICommissionManager.addContainerAllowedToken.selector,
                            ICommissionManager.removeContainerAllowedToken.selector,

                            ICommissionContainer.withdrawCommission.selector,
                            ICommissionContainer.updateCommissionPercent.selector,
                            ICommissionContainer.addAllowedToken.selector,
                            ICommissionContainer.commissionAmount.selector,

                            Auction.withdraw.selector
            ];

        bytes4[] memory selectors = new bytes4[](temporary.length);
        for (uint i = 0; i < temporary.length; i++) {
            selectors[i] = temporary[i];
        }

        return selectors;
    }
}
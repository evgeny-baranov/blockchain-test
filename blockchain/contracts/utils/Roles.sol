// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {Accounting} from "../Accounting.sol";
import {AuctionLot} from "../AuctionLot.sol";
import {EuroToken} from "../EuroToken.sol";
import {ICommissionContainer} from "../utils/commission-container/ICommissionContainer.sol";
import {IRegistry} from "./access-manager/IRegistry.sol";
import {IAuctionV1} from "../auction/IAuctionV1.sol";

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
        RoleSelectors[] memory roleSelectors = new RoleSelectors[](4);

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

        return roleSelectors;
    }

    function getBurnSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = ERC721BurnableUpgradeable.burn.selector;
        selectors[1] = ERC20BurnableUpgradeable.burn.selector;
        selectors[2] = ERC20BurnableUpgradeable.burnFrom.selector;
        return selectors;
    }

    function getMintSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](2);
        selectors[0] = AuctionLot.mint.selector;
        selectors[1] = EuroToken.mint.selector;
        return selectors;
    }

    function getUpgradeSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](2);
        selectors[0] = UUPSUpgradeable.upgradeToAndCall.selector;
        selectors[1] = IRegistry.registerContract.selector;
        return selectors;
    }

    function getAccountantSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](9);
        selectors[0] = Accounting.withdrawContainerCommission.selector;
        selectors[1] = Accounting.updateContainerCommissionPercent.selector;
        selectors[2] = Accounting.addContainerAllowedToken.selector;
        selectors[3] = Accounting.containerCommissionAmount.selector;

        selectors[4] = ICommissionContainer.withdrawCommission.selector;
        selectors[5] = ICommissionContainer.updateCommissionPercent.selector;
        selectors[6] = ICommissionContainer.addAllowedToken.selector;
        selectors[7] = ICommissionContainer.commissionAmount.selector;

        selectors[8] = IAuctionV1.withdraw.selector;
        return selectors;
    }
}
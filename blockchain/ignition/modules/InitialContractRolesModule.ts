import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import DeployAllModule from "./DeployAllModule";
import {Roles} from "../../app/roles.type";

export default buildModule("InitialContractRolesModule", (builder) => {

    const {accessManager, auction, accounting} = builder.useModule(DeployAllModule);

    const owner = builder.getAccount(0);

    const accessManagerImplementation = builder.contractAt(
        "AccessManager",
        accessManager
    );

    // AUCTION: Set up initial roles
    builder.call(accessManagerImplementation, "grantRole", [
        Roles.MINTER_ROLE,
        auction,
        0
    ], {
        id: "grantRole_Auction_MINTER_ROLE",
        from: owner
    });
    builder.call(accessManagerImplementation, "grantRole", [
        Roles.BURNER_ROLE,
        auction,
        0
    ], {
        id: "grantRole_Auction_BURNER_ROLE",
        from: owner
    });

    // ACCOUNTING: Set up initial roles
    builder.call(accessManagerImplementation, "grantRole", [
        Roles.MINTER_ROLE,
        accounting,
        0
    ], {
        id: "grantRole_Accounting_MINTER_ROLE",
        from: owner
    });

    builder.call(accessManagerImplementation, "grantRole", [
        Roles.BURNER_ROLE,
        accounting,
        0
    ], {
        id: "grantRole_Accounting_BURNER_ROLE",
        from: owner
    });

    builder.call(accessManagerImplementation, "grantRole", [
        Roles.ACCOUNTANT_ROLE,
        accounting,
        0
    ], {
        id: "grantRole_Accounting_ACCOUNTANT_ROLE",
        from: owner
    });

    return {};
});

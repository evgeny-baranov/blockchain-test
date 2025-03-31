import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import DeployAllModule from "./DeployAllModule";
import {Roles} from "./roles.type";

export default buildModule("PostDeploySetupModule", (builder) => {

    const {accessManager, auction, accounting, auctionLot, euroToken} = builder.useModule(DeployAllModule);

    const owner = builder.getAccount(0);

    const accessManagerImplementation = builder.contractAt(
        "AccessManager",
        accessManager
    );

    // initRoleSelectors
    builder.call(accessManagerImplementation, "initRoleSelectors", [euroToken], {
        id: "initRoleSelectorsEuroToken",
        from: owner,
    });
    builder.call(accessManagerImplementation, "initRoleSelectors", [auctionLot], {
        id: "initRoleSelectorsAuctionLot",
        from: owner,
    });
    builder.call(accessManagerImplementation, "initRoleSelectors", [auction], {
        id: "initRoleSelectorsAuction",
        from: owner,
    });
    builder.call(accessManagerImplementation, "initRoleSelectors", [accounting], {
        id: "initRoleSelectorsAccounting",
        from: owner,
    });

    // registerContract
    builder.call(accessManagerImplementation, "registerContract", ["AuctionLot", auctionLot], {
        id: "registerAuctionLot",
        from: owner
    });
    builder.call(accessManagerImplementation, "registerContract", ["Auction", auction], {
        id: "registerAuction",
        from: owner,
    });
    builder.call(accessManagerImplementation, "registerContract", ["EuroToken", euroToken], {
        id: "registerEuroToken",
        from: owner
    });
    builder.call(accessManagerImplementation, "registerContract", ["Accounting", accounting], {
        id: "registerAccounting",
        from: owner
    });

    // grantRole auction MINTER_ROLE, ACCOUNTANT_ROLE
    builder.call(accessManagerImplementation, "grantRole", [
        Roles.MINTER_ROLE,
        auction,
        0
    ], {
        id: "MINTER_ROLE",
        from: owner
    });

    builder.call(accessManagerImplementation, "grantRole", [
        Roles.ACCOUNTANT_ROLE,
        auction,
        0
    ], {
        id: "grantRole_Auction_ACCOUNTANT_ROLE",
        from: owner
    });

    return {};
});

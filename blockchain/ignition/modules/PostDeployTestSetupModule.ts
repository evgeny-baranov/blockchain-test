import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import DeployAllModule from "./DeployAllModule";
import {Roles} from "./roles.type";

export default buildModule("PostDeployTestSetupModule", (builder) => {

    const {accessManager} = builder.useModule(DeployAllModule);

    const owner = builder.getAccount(0);

    const accessManagerImplementation = builder.contractAt(
        "AccessManager",
        accessManager
    );

    // Set up initial roles for owner account
    builder.call(accessManagerImplementation, "grantRole", [
        Roles.ACCOUNTANT_ROLE,
        owner,
        0
    ], {
        id: "grantRole_owner_ACCOUNTANT_ROLE",
        from: owner
    });

    builder.call(accessManagerImplementation, "grantRole", [
        Roles.MINTER_ROLE,
        owner,
        0
    ], {
        id: "grantRole_owner_MINTER_ROLE",
        from: owner
    });

    builder.call(accessManagerImplementation, "grantRole", [
        Roles.BURNER_ROLE,
        owner,
        0
    ], {
        id: "grantRole_owner_BURNER_ROLE",
        from: owner
    });

    return {};
});

import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import DeployAllModule from "./DeployAllModule";
import {NamedArtifactContractDeploymentFuture} from "@nomicfoundation/ignition-core/dist/src/types/module";

export default buildModule("PostDeploySetupModule", (builder) => {

    const {accessManager, auction, accounting, auctionLot, euroToken, usdToken} = builder.useModule(DeployAllModule);

    const owner = builder.getAccount(0);

    const accessManagerImplementation = builder.contractAt(
        "AccessManager",
        accessManager,
    );

    function initRoleFor(target: NamedArtifactContractDeploymentFuture<any>, label: string) {
        builder.call(accessManagerImplementation, "initRoleSelectors", [target], {
            id: `initRoleSelectors_${label}`,
            from: owner,
        });

        builder.call(accessManagerImplementation, "registerContract", [label, auctionLot], {
            id: `registerContract_${label}`,
            from: owner
        });
    }

    initRoleFor(euroToken, 'EuroToken');
    initRoleFor(usdToken, 'UsdToken');
    initRoleFor(auctionLot, 'AuctionLot');
    initRoleFor(auction, 'Auction');
    initRoleFor(accounting, 'Accounting');

    return {};
});

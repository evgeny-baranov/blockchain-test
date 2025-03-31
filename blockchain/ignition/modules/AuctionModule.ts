import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import AccessManagerModule from "./AccessManagerModule";

export default buildModule("AuctionModule", (builder) => {
    const {accessManager} = builder.useModule(AccessManagerModule);
    const owner = builder.getAccount(0);

    const implementation = builder.contract("AuctionV1", [], {
        from: owner
    });

    const initialize = builder.encodeFunctionCall(implementation, "initialize", [accessManager]);

    const auction = builder.contract('ERC1967Proxy', [implementation, initialize]);

    return {auction};
});

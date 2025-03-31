import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import AccessManagerModule from "./AccessManagerModule";

export default buildModule("AuctionLotModule", (builder) => {
    const {accessManager} = builder.useModule(AccessManagerModule);
    const owner = builder.getAccount(0);

    const implementation = builder.contract("AuctionLotV1", [], {
        from: owner
    });

    const initialize = builder.encodeFunctionCall(implementation, "initialize", [accessManager]);

    const auctionLot = builder.contract(
        'ERC1967Proxy',
        [implementation, initialize],
        {
            id: "AuctionLotProxy"
        }
    );

    return {auctionLot};
});

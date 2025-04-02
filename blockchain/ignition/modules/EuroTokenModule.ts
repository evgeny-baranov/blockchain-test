import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import AccessManagerModule from "./AccessManagerModule";

export default buildModule("EuroTokenModule", (builder) => {
    const {accessManager} = builder.useModule(AccessManagerModule);
    const owner = builder.getAccount(0);

    const implementation = builder.contract("EuroTokenV1", [], {
        from: owner
    });

    const initialize = builder.encodeFunctionCall(implementation, "initialize", [accessManager]);

    const euroToken = builder.contract(
        'ERC1967Proxy',
        [implementation, initialize],
        {
            id: 'EuroTokenProxy'
        }
    );

    return {euroToken};
});

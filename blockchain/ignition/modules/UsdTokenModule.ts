import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import AccessManagerModule from "./AccessManagerModule";

export default buildModule("UsdTokenModule", (builder) => {
    const {accessManager} = builder.useModule(AccessManagerModule);
    const owner = builder.getAccount(0);

    const implementation = builder.contract("UsdTokenV1", [], {
        from: owner
    });

    const initialize = builder.encodeFunctionCall(implementation, "initialize", [accessManager]);

    const usdToken = builder.contract(
        'ERC1967Proxy',
        [implementation, initialize],
        {
            id: 'UsdTokenProxy'
        }
    );

    return {usdToken};
});

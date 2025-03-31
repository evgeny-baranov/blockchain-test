import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AccessManagerModule", (builder) => {
    const owner = builder.getAccount(0);

    const implementation = builder.contract("AccessManagerV1", [], {
        from: owner,
        id: "AccessManagerImplementation"
    });

    const initialize = builder.encodeFunctionCall(implementation, "initialize", [owner]);

    // Deploy the ERC1967 Proxy, pointing to the implementation
    const accessManager = builder.contract(
        'ERC1967Proxy',
        [implementation, initialize],
        {
            id: "AccessManagerProxy"
        }
    );

    return {accessManager};
});
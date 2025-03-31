import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import AccessManagerModule from "./AccessManagerModule";

export default buildModule("AccountingModule", (builder) => {
    const {accessManager} = builder.useModule(AccessManagerModule);
    const owner = builder.getAccount(0);

    const implementation = builder.contract("AccountingV1", [], {
        from: owner
    });

    const initialize = builder.encodeFunctionCall(implementation, "initialize", [accessManager]);

    const accounting = builder.contract('ERC1967Proxy', [implementation, initialize], {
        id: "AccountingProxy"
    });

    return {accounting};
});

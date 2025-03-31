import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

import AccessManagerModule from "./AccessManagerModule";
import AuctionLotModule from "./AuctionLotModule";
import AuctionModule from "./AuctionModule";
import EuroTokenV1Module from "./EuroTokenModule";
import AccountingModule from "./AccountingModule";

export default buildModule("DeployAllModule", (m) => {
    const {accessManager} = m.useModule(AccessManagerModule);
    const {auctionLot} = m.useModule(AuctionLotModule);
    const {auction} = m.useModule(AuctionModule);
    const {euroToken} = m.useModule(EuroTokenV1Module);
    const {accounting} = m.useModule(AccountingModule);

    return {
        accessManager,
        auctionLot,
        auction,
        euroToken,
        accounting,
    };
});

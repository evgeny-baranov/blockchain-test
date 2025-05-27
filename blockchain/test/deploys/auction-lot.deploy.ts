import {ethers, upgrades} from "hardhat";
import {AccessManager, AuctionLot} from "../../typechain";

export async function deployAuctionLot(accessManager: AccessManager): Promise<AuctionLot> {
    const factory = await ethers.getContractFactory("AuctionLotV1");
    const auctionLot = await upgrades.deployProxy(factory, [await accessManager.getAddress()], {
        initializer: "initialize",
    });

    await auctionLot.waitForDeployment();

    const auctionLotAddress = await auctionLot.getAddress();

    await accessManager.initRoleSelectors(auctionLotAddress);
    await accessManager.registerContract('AuctionLot', auctionLotAddress);

    return auctionLot;
}
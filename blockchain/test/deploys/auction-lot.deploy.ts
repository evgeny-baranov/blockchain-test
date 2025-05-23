import {ethers, upgrades} from "hardhat";
import {AccessManager, AuctionLot} from "../../typechain-types";

export async function deployAuctionLot(accessManager: AccessManager): Promise<AuctionLot> {
    const factory = await ethers.getContractFactory("AuctionLotV1");
    const auctionLot = await upgrades.deployProxy(factory, [await accessManager.getAddress()], {
        initializer: "initialize",
    });

    await auctionLot.waitForDeployment();

    return auctionLot;
}
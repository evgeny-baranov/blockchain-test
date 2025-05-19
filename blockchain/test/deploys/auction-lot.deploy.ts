import {ethers, upgrades} from "hardhat";
import {AccessManager, AuctionLot} from "../../typechain-types";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

export async function deployAuctionLot(owner: HardhatEthersSigner, accessManager: AccessManager): Promise<AuctionLot> {
    const factory = await ethers.getContractFactory("AuctionLotV1");
    const auctionLot = await upgrades.deployProxy(factory, [await accessManager.getAddress()], {
        initializer: "initialize",
    });

    await auctionLot.waitForDeployment();

    return auctionLot;
}
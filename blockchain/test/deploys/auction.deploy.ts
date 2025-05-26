import {ethers, upgrades} from "hardhat";
import {AccessManager, Auction} from "../../typechain-types";
import {Roles} from "../../app/roles.type";

export async function deployAuction(accessManager: AccessManager): Promise<Auction> {
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("AuctionV1");
    const auction = await upgrades.deployProxy(factory, [await accessManager.getAddress()], {
        initializer: "initialize",
    });

    await auction.waitForDeployment();
    const auctionAddress = await auction.getAddress();
    await accessManager.connect(owner).registerContract('Auction', auctionAddress);

    await accessManager.connect(owner).grantRole(
        Roles.MINTER_ROLE,
        auctionAddress,
        0
    );

    return auction;
}
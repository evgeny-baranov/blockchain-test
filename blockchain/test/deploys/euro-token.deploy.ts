import {ethers, upgrades} from "hardhat";
import {EuroToken, AccessManager} from "../../typechain-types";

export async function deployEuroToken(
    accessManager: AccessManager
): Promise<EuroToken> {
    const factory = await ethers.getContractFactory("EuroTokenV1");
    const euroToken = await upgrades.deployProxy(factory, [await accessManager.getAddress()], {
        initializer: "initialize",
    });
    await euroToken.waitForDeployment();
    return euroToken;
}

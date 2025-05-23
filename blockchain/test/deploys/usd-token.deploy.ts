import {ethers, upgrades} from "hardhat";
import {UsdToken, AccessManager} from "../../typechain-types";

export async function deployUsdToken(
    accessManager: AccessManager
): Promise<UsdToken> {
    const factory = await ethers.getContractFactory("UsdTokenV1");
    const usdToken = await upgrades.deployProxy(factory, [await accessManager.getAddress()], {
        initializer: "initialize",
    });
    await usdToken.waitForDeployment();
    return usdToken;
}

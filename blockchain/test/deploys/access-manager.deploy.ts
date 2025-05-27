import {ethers, upgrades} from "hardhat";
import {AccessManager} from "../../typechain";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

export async function deployAccessManager(owner: HardhatEthersSigner): Promise<AccessManager> {
    const AccessManager = await ethers.getContractFactory("AccessManagerV1");
    const accessManager = await upgrades.deployProxy(AccessManager, [owner.address], {
        initializer: "initialize",
    });

    await accessManager.waitForDeployment();

    return accessManager;
}
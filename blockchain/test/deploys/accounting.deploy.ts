import {ethers, upgrades} from "hardhat";
import {AccessManager, Accounting} from "../../typechain";
import {Roles} from "../../app/roles.type";

export async function deployAccounting(accessManager: AccessManager): Promise<Accounting> {
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("AccountingV1");
    const accounting = await upgrades.deployProxy(factory, [await accessManager.getAddress()], {
        initializer: "initialize",
    });

    await accounting.waitForDeployment();
    const accountingAddress = await accounting.getAddress();
    await accessManager.initRoleSelectors(accountingAddress);
    await accessManager.connect(owner).registerContract('Accounting', accountingAddress);

    await accessManager.connect(owner).grantRole(
        Roles.MINTER_ROLE,
        accountingAddress,
        0
    );
    await accessManager.connect(owner).grantRole(
        Roles.ACCOUNTANT_ROLE,
        accountingAddress,
        0
    );

    return accounting;
}
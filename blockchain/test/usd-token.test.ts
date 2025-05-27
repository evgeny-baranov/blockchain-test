import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {ethers} from "hardhat";
import {AccessManager, UsdToken} from "../typechain";
import {deployUsdToken} from "./deploys/usd-token.deploy";
import {Roles} from "../app/roles.type";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("UsdTokenV1", function () {
    let accessManager: AccessManager;
    let usdToken: UsdToken;
    let owner: HardhatEthersSigner;
    let minter: HardhatEthersSigner;
    let burner: HardhatEthersSigner;
    let custodian: HardhatEthersSigner;
    let unauthorized: HardhatEthersSigner;

    beforeEach(async () => {
        [owner, minter, burner, custodian, unauthorized] = await ethers.getSigners();

        accessManager = await deployAccessManager(owner);
        usdToken = await deployUsdToken(accessManager);

        await accessManager.grantRole(Roles.MINTER_ROLE, minter.address, 0);
        await accessManager.grantRole(Roles.BURNER_ROLE, burner.address, 0);
        await accessManager.grantRole(Roles.CUSTODIAN_ROLE, custodian.address, 0);
    });

    it("should mint tokens to sender by authorized user", async () => {
        await usdToken.connect(minter).mint(1000);
        expect(
            await usdToken.balanceOf(minter.address)
        ).to.equal(1000);
    });

    it("should burn tokens from sender by authorized user", async () => {
        await usdToken.connect(minter).mintTo(burner.address, 1000);
        await usdToken.connect(burner).burn(300)
        expect(
            await usdToken.balanceOf(burner.address)
        ).to.equal(700);
    });

    it("should mint tokens to another user by authorized user", async () => {
        await usdToken.connect(minter).mintTo(unauthorized.address, 500);
        expect(
            await usdToken.balanceOf(unauthorized.address)
        ).to.equal(500);
    });

    it("should burn tokens by holder", async () => {
        await usdToken.connect(minter).mintTo(unauthorized.address, 1000);
        await usdToken.connect(unauthorized).approve(burner.address, 400);
        await usdToken.connect(burner).burnFrom(unauthorized.address, 400);
        expect(await usdToken.balanceOf(unauthorized.address)).to.equal(600);
    });

    it("should burn tokens from user with approval", async () => {
        await usdToken.connect(minter).mintTo(unauthorized.address, 1000);
        await usdToken.connect(unauthorized).approve(burner.address, 500);
        await usdToken.connect(burner).burnFrom(unauthorized.address, 500);
        expect(await usdToken.balanceOf(unauthorized.address)).to.equal(500);
    });
});

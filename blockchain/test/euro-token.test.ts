import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {deployEuroToken} from "./deploys/euro-token.deploy";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {ethers} from "hardhat";
import {AccessManager, EuroToken} from "../typechain";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {Roles} from "../app/roles.type";

describe("EuroTokenV1", function () {
    let accessManager: AccessManager;
    let euroToken: EuroToken;
    let owner: HardhatEthersSigner;
    let minter: HardhatEthersSigner;
    let burner: HardhatEthersSigner;
    let custodian: HardhatEthersSigner;
    let unauthorized: HardhatEthersSigner;

    beforeEach(async () => {
        [owner, minter, burner, custodian, unauthorized] = await ethers.getSigners();

        accessManager = await deployAccessManager(owner);
        euroToken = await deployEuroToken(accessManager);

        await accessManager.grantRole(Roles.MINTER_ROLE, minter.address, 0);
        await accessManager.grantRole(Roles.BURNER_ROLE, burner.address, 0);
        await accessManager.grantRole(Roles.CUSTODIAN_ROLE, custodian.address, 0);
    });

    it("should mint tokens to sender by authorized user", async () => {
        await euroToken.connect(minter).mint(1000);
        expect(
            await euroToken.balanceOf(minter.address)
        ).to.equal(1000);
    });

    it("should burn tokens from sender by authorized user", async () => {
        await euroToken.connect(minter).mintTo(burner.address, 1000);
        await euroToken.connect(burner).burn(300)
        expect(
            await euroToken.balanceOf(burner.address)
        ).to.equal(700);
    });

    it("should mint tokens to another user by authorized user", async () => {
        await euroToken.connect(minter).mintTo(unauthorized.address, 500);
        expect(
            await euroToken.balanceOf(unauthorized.address)
        ).to.equal(500);
    });

    it("should burn tokens by holder", async () => {
        await euroToken.connect(minter).mintTo(unauthorized.address, 1000);
        await euroToken.connect(unauthorized).approve(burner.address, 400);
        await euroToken.connect(burner).burnFrom(unauthorized.address, 400);
        expect(await euroToken.balanceOf(unauthorized.address)).to.equal(600);
    });

    it("should burn tokens from user with approval", async () => {
        await euroToken.connect(minter).mintTo(unauthorized.address, 1000);
        await euroToken.connect(unauthorized).approve(burner.address, 500);
        await euroToken.connect(burner).burnFrom(unauthorized.address, 500);
        expect(await euroToken.balanceOf(unauthorized.address)).to.equal(500);
    });
});

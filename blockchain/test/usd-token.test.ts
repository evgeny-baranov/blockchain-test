import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {ethers} from "hardhat";
import {AccessManager, UsdToken} from "../typechain-types";
import {deployUsdToken} from "./deploys/usd-token.deploy";

describe("UsdTokenV1", function () {
    let accessManager: AccessManager;
    let usdToken: UsdToken;
    let owner: any;
    let user: any;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();
        accessManager = await deployAccessManager(owner);
        usdToken = await deployUsdToken(accessManager);
    });

    it("should mint tokens to sender by authorized user", async () => {
        await usdToken.connect(owner).mint(1000);
        expect(await usdToken.balanceOf(owner.address)).to.equal(1000);
    });

    it("should mint tokens to another user by authorized user", async () => {
        await usdToken.connect(owner).mintTo(user.address, 500);
        expect(await usdToken.balanceOf(user.address)).to.equal(500);
    });

    it("should burn tokens by holder", async () => {
        await usdToken.connect(owner).mint(1000);
        await usdToken.connect(owner).burn(400);
        expect(await usdToken.balanceOf(owner.address)).to.equal(600);
    });

    it("should burn tokens from user with approval", async () => {
        await usdToken.connect(owner).mintTo(user.address, 1000);
        await usdToken.connect(user).approve(owner.address, 500);
        await usdToken.connect(owner).burnFrom(user.address, 500);
        expect(await usdToken.balanceOf(user.address)).to.equal(500);
    });
});
